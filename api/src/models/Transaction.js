const mongoose = require("mongoose");
const crypto = require("crypto");

const ENC_PREFIX = "enc:";
const ENC_ALGO = "aes-256-gcm";

const getEncryptionKey = () => {
  const rawKey = process.env.TRANSACTION_PAYOUT_ENCRYPTION_KEY;
  if (!rawKey) return null;
  return crypto.createHash("sha256").update(String(rawKey)).digest();
};

const isEncrypted = (value) =>
  typeof value === "string" && value.startsWith(ENC_PREFIX);

const encryptValue = (value) => {
  if (!value) return value;
  if (isEncrypted(value)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENC_ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptValue = (value) => {
  if (!value || !isEncrypted(value)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  try {
    const [, payload] = value.split(ENC_PREFIX);
    const [ivHex, tagHex, encryptedHex] = payload.split(":");
    const decipher = crypto.createDecipheriv(
      ENC_ALGO,
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    return value;
  }
};

const maskValue = (value, visibleCount = 4) => {
  if (!value) return null;
  const clean = String(value);
  if (clean.length <= visibleCount) return "*".repeat(clean.length);
  return `${"*".repeat(Math.max(clean.length - visibleCount, 0))}${clean.slice(-visibleCount)}`;
};

const decryptSensitiveFields = (doc) => {
  if (!doc?.payoutDetails) return;
  if (doc.payoutDetails.upiId) {
    doc.payoutDetails.upiId = decryptValue(doc.payoutDetails.upiId);
  }
  if (doc.payoutDetails.bankDetails?.accountNumber) {
    doc.payoutDetails.bankDetails.accountNumber = decryptValue(
      doc.payoutDetails.bankDetails.accountNumber,
    );
  }
};

const TransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    instructorShare: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["captured", "settled", "refunded"],
      default: "captured",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    payoutDetails: {
      paymentToken: {
        type: String,
        default: null,
      },
      upiId: String,
      bankDetails: {
        accountNumber: String,
        ifsc: String,
        bankName: String,
      },
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

TransactionSchema.pre("save", function encryptPayoutDetails(next) {
  if (this.payoutDetails?.upiId) {
    this.payoutDetails.upiId = encryptValue(this.payoutDetails.upiId);
  }

  if (this.payoutDetails?.bankDetails?.accountNumber) {
    this.payoutDetails.bankDetails.accountNumber = encryptValue(
      this.payoutDetails.bankDetails.accountNumber,
    );
  }

  next();
});

TransactionSchema.post("init", (doc) => {
  decryptSensitiveFields(doc);
});

TransactionSchema.post("find", (docs) => {
  docs.forEach((doc) => decryptSensitiveFields(doc));
});

TransactionSchema.post("findOne", (doc) => {
  if (doc) decryptSensitiveFields(doc);
});

const redactPayout = (doc, ret) => {
  if (!ret.payoutDetails) return ret;

  const plainUpi = decryptValue(ret.payoutDetails.upiId);
  const plainAccount = decryptValue(
    ret.payoutDetails?.bankDetails?.accountNumber,
  );

  ret.payoutDetails = {
    ...ret.payoutDetails,
    upiId: plainUpi ? maskValue(plainUpi, 4) : null,
    bankDetails: {
      ...(ret.payoutDetails.bankDetails || {}),
      accountNumber: plainAccount ? maskValue(plainAccount, 4) : null,
    },
  };

  return ret;
};

TransactionSchema.set("toJSON", {
  transform: (doc, ret) => redactPayout(doc, ret),
});

TransactionSchema.set("toObject", {
  transform: (doc, ret) => redactPayout(doc, ret),
});

module.exports = mongoose.model("Transaction", TransactionSchema);
