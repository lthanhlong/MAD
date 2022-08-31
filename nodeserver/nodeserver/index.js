//make a express server
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const Database = require('./database');

const db = new Database();
//user cors body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());


//listen
app.listen(process.env.PORT, () => {

    console.log(`listening on port ${process.env.PORT}`);
})

//add item
app.post('/addItem', async (req, res) => {
    const { userId, name, price, description, pictureURL, category, discountPrice, quantity } = req.body;
    try {
        let result = await db.addProduct(userId, name, price, description, pictureURL, category, discountPrice, quantity)

        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
})
//update item
app.put('/updateItem', async (req, res) => {
    const { userId, productId, name, price, description, pictureURL, category, discountPrice, quantity } = req.body;
    try {
        let result = await db.updateProduct(userId, productId, name, price, description, pictureURL, category, discountPrice, quantity)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
})

//delete item
app.delete('/deleteItem', async (req, res) => {
    const productId = req.query.id;
    const userId = req.query.userId;

    try {
        let result = await db.deleteProduct(userId, productId)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
})
//admin update user
app.put('/updateUserAdmin', async (req, res) => {

    const { adminId, userId, fullName, email, password, role } = req.body;
    console.log(adminId, userId, fullName, email, password, role)
    try {
        let result = await db.updateUserAdmin(adminId, userId, fullName, email, password, role)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}
)
//createUser
app.post('/createUser', async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        let result = await db.createUser(email, fullName, password)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
})
//Update user info
app.put('/updateUser', async (req, res) => {
    const { userId, email, fullName } = req.body;
    try {
        let result = await db.updateUserInfo(userId, email, fullName, "")
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}
)
//login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let result = await db.login(email, password)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send('error');
    }
})
//update userpassword
app.put('/updateUserPassword', async (req, res) => {
    const { userId, oldpassword, newpassword } = req.body;
    try {
        let result = await db.updateUserPassword(userId, oldpassword, newpassword)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}
)
//delete user
app.delete('/deleteUser', async (req, res) => {
    const userId = req.query.id;

    try {
        let result = await db.deleteUser(userId)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
})
// add comment
app.post('/addComment', async (req, res) => {
    const { userId, productId, comment, time } = req.body;
    try {
        let result = await db.addComment(userId, productId, comment, time)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
})
// add bookmark
app.post('/updateBookmark', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        let result = await db.updateUserBookmark(userId, productId)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}
)
//delete item from bookmark
app.delete('/deleteBookmark', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        let result = await db.deleteUserBookmark(userId, productId)
        if (!result) {

            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}

)
//add item to cart
app.post('/addCart', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        let result = await db.addToCart(userId, productId)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}
)
//update cart item


//delete item from cart
app.delete('/deleteCart', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        let result = await db.deleteFromCart(userId, productId)
        if (!result) {
            res.status(500).send('error');
        } else {
            res.status(200).send('success');
        }
    } catch (err) {
        res.status(500).send('error');
    }
}
)
//make Payment
app.post('/makePayment', async (req, res) => {
    const { data, userId } = req.body;
    try {
        let result = await db.makePayment(data, userId)
        if (!result) {
            console.log(result)
            res.status(500).send('error');
        } else {

            res.status(200).send('success');
        }
    } catch (err) {

        res.status(500).send('error');
    }
})




