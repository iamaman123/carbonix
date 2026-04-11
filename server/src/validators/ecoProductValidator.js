import Joi from "joi";

export const createEcoProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    "string.min": "Product name must be at least 3 characters long",
    "string.max": "Product name must not exceed 200 characters",
    "any.required": "Product name is required",
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description must not exceed 2000 characters",
    "any.required": "Description is required",
  }),
  category: Joi.string()
    .valid(
      "Solar Equipment",
      "Energy Storage",
      "EV Accessories",
      "Eco Home",
      "Sustainable Fashion",
      "Organic & Natural",
      "Recycled Products",
      "Water Conservation",
      "Others",
    )
    .required()
    .messages({
      "any.only": "Invalid product category",
      "any.required": "Category is required",
    }),
  price: Joi.number().min(0).max(10000000).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be at least 0",
    "number.max": "Price must not exceed 10,000,000",
    "any.required": "Price is required",
  }),
  stock: Joi.number().integer().min(0).max(1000000).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be a whole number",
    "number.min": "Stock cannot be negative",
    "number.max": "Stock must not exceed 1,000,000",
    "any.required": "Stock quantity is required",
  }),
  imageUrl: Joi.string().uri().allow("").optional().messages({
    "string.uri": "Image URL must be a valid URL",
  }),
  ecoRating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.min": "Eco rating must be between 1 and 5",
    "number.max": "Eco rating must be between 1 and 5",
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  specifications: Joi.string().max(3000).allow("").optional(),
  carbonEmissionSaved: Joi.number().min(0).max(100000).allow(null).optional().messages({
    "number.min": "Carbon emission saved must be a positive number",
  }),
  status: Joi.string()
    .valid("Active", "OutOfStock", "Discontinued")
    .default("Active")
    .optional(),
});

export const updateEcoProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  category: Joi.string()
    .valid(
      "Solar Equipment",
      "Energy Storage",
      "EV Accessories",
      "Eco Home",
      "Sustainable Fashion",
      "Organic & Natural",
      "Recycled Products",
      "Water Conservation",
      "Others",
    )
    .optional(),
  price: Joi.number().min(0).max(10000000).optional(),
  stock: Joi.number().integer().min(0).max(1000000).optional(),
  imageUrl: Joi.string().uri().allow("").optional(),
  ecoRating: Joi.number().integer().min(1).max(5).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  specifications: Joi.string().max(3000).allow("").optional(),
  carbonEmissionSaved: Joi.number().min(0).max(100000).allow(null).optional(),
  status: Joi.string().valid("Active", "OutOfStock", "Discontinued").optional(),
});

export const purchaseEcoProductSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid product ID",
      "any.required": "Product ID is required",
    }),
  quantity: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(1000)
    .required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be a whole number",
      "number.positive": "Quantity must be positive",
      "number.min": "Quantity must be at least 1",
      "number.max": "Quantity must not exceed 1,000",
      "any.required": "Quantity is required",
    }),
  shippingAddress: Joi.string().max(500).allow("").optional(),
});

export const verifyRazorpayEcoSchema = Joi.object({
  orderId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid order ID" }),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});
