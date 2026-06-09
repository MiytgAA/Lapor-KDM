'use strict';

/**
 * Factory middleware validasi input menggunakan Joi
 * @param {Object} schema - Joi schema
 * @param {'body'|'query'|'params'} source - Sumber data yang divalidasi
 * 
 * Penggunaan:
 *   router.post('/...', validate(registerSchema), handler)
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,      // Tampilkan semua error sekaligus
      stripUnknown: true,     // Hapus field yang tidak dikenal
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.context?.key || detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return res.status(422).json({
        success: false,
        message: 'Validasi gagal',
        errors,
      });
    }

    // Replace dengan nilai yang sudah divalidasi (stripped)
    req[source] = value;
    next();
  };
};

module.exports = { validate };
