const User = require('../../models/User');
const Book = require('../../models/Book');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    user: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            throw new Error("User not found");
        }
        
        if (!user)
            return null
        else
            return { ...user._doc, password: null, _id: user.id };
    },
    books: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");
        
        let books;
        try {
            books = await Book.find({ ownerId: userId });
        } catch(e) {
            throw new Error("An error has accured");
        }

        return books;

    },

    book: async(parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");
        
        let book;
        try {
            book = await Book.findOne({ $and: [{ ownerId: userId }, { _id: args.id }] });
        } catch(e) {
            throw new Error("Book not found");
        }
        return book;
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