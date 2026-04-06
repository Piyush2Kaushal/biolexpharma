const { body, param, validationResult } = require('express-validator');

// Run validators and short-circuit with 400 if errors exist
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// ── Auth ──────────────────────────────────────────────────────────────────────
const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Category ─────────────────────────────────────────────────────────────────
const categoryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

// ── Product ──────────────────────────────────────────────────────────────────
const productRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category ID'),
];

// ── Inquiry ──────────────────────────────────────────────────────────────────
const inquiryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ max: 20 })
    .withMessage('Phone cannot exceed 20 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  body('productId').optional({ nullable: true }).isMongoId().withMessage('Invalid product ID'),
];

// ── Status update ────────────────────────────────────────────────────────────
const statusRules = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'contacted', 'resolved'])
    .withMessage('Status must be one of: pending, contacted, resolved'),
];

// ── Param ID ─────────────────────────────────────────────────────────────────
const idParamRule = [param('id').isMongoId().withMessage('Invalid ID format')];

module.exports = {
  validate,
  loginRules,
  categoryRules,
  productRules,
  inquiryRules,
  statusRules,
  idParamRule,
};
