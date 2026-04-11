import Joi from "joi";

export const createListingSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title must not exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description must not exceed 2000 characters",
    "any.required": "Description is required",
  }),
  quantity: Joi.number().integer().min(1).max(1000000000).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity must not exceed 1 billion",
    "any.required": "Quantity is required",
  }),
  pricePerCredit: Joi.number().min(0).max(100000).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be at least 0",
    "number.max": "Price must not exceed 100,000",
    "any.required": "Price per credit is required",
  }),
  location: Joi.string().min(2).max(200).required().messages({
    "string.min": "Location must be at least 2 characters long",
    "string.max": "Location must not exceed 200 characters",
    "any.required": "Location is required",
  }),
  projectType: Joi.string()
    .valid(
      "Reforestation",
      "Renewable Energy",
      "Waste Management",
      "Agriculture",
      "Blue Carbon",
      "Others"
    )
    .required()
    .messages({
      "any.only": "Invalid project type",
      "any.required": "Project type is required",
    }),
  verification: Joi.object({
    verifiedBy: Joi.string()
      .valid("VCS", "Gold Standard", "CDM", "ACR", "Others")
      .required()
      .messages({
        "any.only": "Invalid verification standard",
        "any.required": "Verification standard is required",
      }),
    certificateUrl: Joi.string().uri().allow("").optional().messages({
      "string.uri": "Certificate URL must be a valid URL",
    }),
  }).required(),
  // Backward compatibility: client may still send these fields.
  // They are ignored so server controls workflow and price integrity.
  status: Joi.any().strip().optional(),
  totalPrice: Joi.any().strip().optional(),
});

export const paymentSchema = Joi.object({
  listingId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid listing ID",
      "any.required": "Listing ID is required",
    }),
  quantity: Joi.number().positive().min(0.01).max(1000000000).required().messages({
    "number.base": "Quantity must be a number",
    "number.positive": "Quantity must be a positive number",
    "number.min": "Quantity must be at least 0.01",
    "number.max": "Quantity must not exceed 1 billion",
    "any.required": "Quantity is required",
  }),
  paymentMethod: Joi.string().valid("card", "upi").optional(),
});

export const verifyRazorpayCreditSchema = Joi.object({
  transactionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid transaction ID" }),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});
