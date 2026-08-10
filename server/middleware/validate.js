const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({ error: messages.join(', ') });
    }
    req.body = result.data;
    next();
  };
};

module.exports = validate;