import { Schema, model } from "mongoose";

const AuditSchema = new Schema({
  auditAction: {
    type: String,
    trim: true,
    required: true,
  },
  auditStatus: {
    type: Number,
    required: true,
  },
  auditBy: {
    type: Schema.Types.ObjectId,
  },
  auditOn: {
    type: String,
    required: true,
  },
  timestamp: { type: Date, default: Date.now }
});

const Audit = model("audit", AuditSchema);
export default Audit;
