const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    user: async (parent, args) => {
        const user = await User.findById(args.id);
        return { ...user._doc, password: null, _id: user.id };
    },
    login: async (parent, args) => {

        const { usernameOrEmail, password } = args;
        const user = await User.findOne({ $or: [{username: usernameOrEmail}, {email: usernameOrEmail}] });

        if (!user)
            throw new Error("email or password is incorrect");

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch)
            throw new Error("email or password is incorrect");

        const { JWT_SECRET } = process.env;
        const token = jwt.sign({ userId: user.id, email: user.email}, JWT_SECRET, {
            expiresIn: '1h'
        });

        return { id: user.id, token, tokenExpiration: 1 }

    }
}