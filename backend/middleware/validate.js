const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
            if (error) {
                const errors = error.details.map((detail) => detail.message);
                console.error('Validation Error for', req.originalUrl, ':', errors, 'Body:', req.body);
                return res.status(400).json({ message: 'Validation error', errors });
            }
            next();
        } catch (err) {
            console.error('Validation middleware crash:', err);
            return res.status(500).json({ message: 'Validation middleware crash', error: err.message });
        }
    };
};

// Validation schemas
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().optional().allow('').messages({
        'string.email': 'البريد الإلكتروني غير صحيح'
    }),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('student', 'teacher').default('student'),
    phone: Joi.string().pattern(/^\d{11}$/).required().messages({
        'string.pattern.base': 'رقم الهاتف يجب أن يتكون من 11 رقم بالضبط',
        'any.required': 'رقم الهاتف مطلوب'
    }),
    grade: Joi.string().optional().allow(''),
});

const loginSchema = Joi.object({
    phone: Joi.string().required().messages({
        'any.required': 'رقم الهاتف مطلوب'
    }),
    password: Joi.string().required().messages({
        'any.required': 'كلمة السر مطلوبة'
    }),
});

const bookSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(2000).optional().allow(''),
  price: Joi.alternatives().try(Joi.number().min(0), Joi.string().pattern(/^\d+(\.\d+)?$/)).required(),
  category: Joi.string().optional().allow(''),
  stock: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().pattern(/^\d+$/)).required(),
  isbn: Joi.string().optional().allow(''),
  pages: Joi.alternatives().try(Joi.number().integer().min(1), Joi.string().pattern(/^\d+$/)).optional().allow(''),
  grade: Joi.string().optional().allow(''),
  teacherName: Joi.string().max(100).optional().allow(''),
  isStoreProduct: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
});

const orderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            book: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
        })
    ).min(1).required(),
    shippingAddress: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        governorate: Joi.string().required(),
        postalCode: Joi.string().optional().allow(''),
    }).required(),
    paymentMethod: Joi.string().valid('cod', 'stripe', 'paymob').default('cod'),
});

const reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().min(6).max(128).required(),
});

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    bookSchema,
    orderSchema,
    reviewSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};