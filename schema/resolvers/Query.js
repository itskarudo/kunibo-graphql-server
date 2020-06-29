const User = require('../../models/User');
const Book = require('../../models/Book');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createRefreshToken, createAccessToken } = require('../../helpers/auth');

module.exports = {
    user: async (parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            throw new Error("USER_NOT_FOUND");
        }
        
        if (!user)
            return null
        else
            return { ...user._doc, password: null, _id: user.id };
    },
    books: async (parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");
        
        let books;
        try {
            books = await Book.find({ ownerId: userId });
        } catch(e) {
            throw new Error("BOOK_NOT_FOUND");
        }

        return books;

    },
    book: async(parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");
        
        let book;
        try {
            book = await Book.findOne({ $and: [{ ownerId: userId }, { _id: args.id }] });
        } catch(e) {
            throw new Error("BOOK_NOT_FOUND");
        }
        return book;
    },
    login: async (parent, args, { res }) => {


        const { usernameOrEmail, password } = args;
        const user = await User.findOne({ $or: [{username: usernameOrEmail}, {email: usernameOrEmail}] });

        if (!user)
            throw new Error("CREDS_NOT_CORRECT");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new Error("CREDS_NOT_CORRECT");


        const token = createAccessToken(user);

        res.cookie('rtid', createRefreshToken(user), {
            httpOnly: true
        });


        return { userId: user.id, token };

    }
}

