const User = require('../../models/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');

const registerSchema = Joi.object({
    username: Joi.string()
                .alphanum()
                .min(4)
                .max(20)
                .required(),
    email: Joi.string()
                .email({ minDomainSegments: 2 }),
    password: Joi.string()
                .min(8).max(30)
                .required(),
    password2: Joi.any()
                .valid(Joi.ref('password'))
                .required()

});

const hashPass = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt)
    return hashedPass;
}

module.exports = {
    register: async (parent, args) => {
        const { username, email, password, password2 } = args;

        // validate the data using Joi
        const { error } = registerSchema.validate({ username, email, password, password2 });

        if (error) throw error;

        // Check if username or email are already used
        const sameUsernameOrEmail = await User.findOne({ $or: [{username}, {email}] });

        if (sameUsernameOrEmail) {
            
            if (sameUsernameOrEmail.username === username)
                throw new Error("Username already registered")
            else if (sameUsernameOrEmail.email === email)
            throw new Error("Email already registered")

        }

        // if it passes all the tests:

        const hashedPass = await hashPass(password);
        const user = new User({ username, email, password: hashedPass });

        await user.save();


        return { ...user._doc, password: null, _id: user.id };
    }
}