var admin = require("firebase-admin");

var serviceAccount = require("./key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

class Database {
    constructor() {
    }
    db = admin.firestore();

    async addProduct(userId, name, price, description, pictureURL, category, discountPrice, quantity) {
        console.log(userId, name, price, description, pictureURL, category, discountPrice, quantity)
        try {
            let checkAdmin = await (await this.db.collection("users").doc(userId).get()).data().role
            if (checkAdmin === "admin") {
                await this.db.collection("items").add({
                    name: name,
                    price: price,
                    description: description,
                    pictureURL: pictureURL,
                    category: category,
                    discountPrice: discountPrice,
                    quantity: quantity,
                    sold: 0,
                });
                return true
            } else {
                return false
            }

        } catch (err) {
            return false
        }


    }
    // update product
    async updateProduct(userId, productId, name, price, description, pictureURL, category, discountPrice, quantity) {
        try {


            let checkAdmin = await (await this.db.collection("users").doc(userId).get()).data().role
            if (checkAdmin === "admin") {
                await this.db.collection("items").doc(productId).update({
                    name: name,
                    price: price,
                    description: description,
                    pictureURL: pictureURL,
                    category: category,
                    discountPrice: discountPrice,
                    quantity: quantity,
                })
                return true
            } else {
                return false
            }

        } catch (err) {
            return false
        }
    }
    //delete Product
    async deleteProduct(userId, productId) {
        try {
            let checkAdmin = await (await this.db.collection("users").doc(userId).get()).data().role
            if (checkAdmin === "admin") {
                await this.db.collection("items").doc(productId).delete().then(() => {
                })

                let users = await this.db.collection("users").get()
                users.forEach(async (user) => {
                    let cart = await user.data().cart
                    let newCart = cart.filter(item => {
                        return item.productId != productId
                    }
                    )
                    await this.db.collection("users").doc(user.id).update({
                        cart: newCart,
                    }).then(() => {
                    })
                }
                )
                //delete product comment
                let comments = await this.db.collection("comments").where("productId", "==", productId).get()
                comments.forEach(async (comment) => {
                    await this.db.collection("comments").doc(comment.id).delete().then(() => {
                    })
                }
                )
                await this.db.collection("users").where("bookmark", "array-contains", productId).get().then(async (user) => {
                    console.log(user.id)
                    user.forEach(async (user) => {
                        console.log(user)
                        await this.db.collection("users").doc(user.id).update({
                            bookmark: admin.firestore.FieldValue.arrayRemove(productId)
                        }).then(() => {
                        })
                    })
                })
                return true
            } else {
                return false
            }

        } catch (err) {
            return false
        }
    }

    //Create user
    async createUser(email, fullName, password) {
        try {
            let checkUser = await this.db.collection("users").where("email", "==", email).get()
            if (checkUser.empty) {
                await this.db.collection("users").add({
                    email: email,
                    fullName: fullName,
                    password: password,
                    pictureURL: "https://cdn-icons-png.flaticon.com/512/1053/1053244.png?w=360",
                    role: "user",
                    bookmark: [],
                    cart: [],
                    orders: [],

                }).then(() => {
                })
                return true;
            }
            else {
                return false;
            }

        } catch (err) {
            return false
        }
    }
    //update user password
    async updateUserPassword(userId, oldpassword, password) {
        try {
            let user = await (await this.db.collection("users").doc(userId).get()).data()
            if (user.password === oldpassword) {
                await this.db.collection("users").doc(userId).update({
                    password: password,
                }).then(() => {
                })
                return true
            } else {
                return false
            }

        } catch (err) {
            return false
        }
    }
    //login
    async login(email, password) {
        try {
            let user = await this.db.collection("users").where("email", "==", email).where("password", "==", password).get()
            if (user.empty) {
                return false
            } else {
                return user.docs[0].id
            }
        } catch (err) {
            return false
        }
    }
    //delete user
    async deleteUser(userId) {
        try {
            await this.db.collection("users").doc(userId).delete().then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }
    //update user for admin
    async updateUserAdmin(adminId, userId, fullName, email, password, role) {
        try {
            let adminUser = await (await this.db.collection("users").doc(adminId).get()).data().role
            if (adminUser === "admin") {
                await this.db.collection("users").doc(userId).update({
                    email: email,
                    password: password,
                    fullName: fullName,
                    role: role,
                }).then(() => {
                })
                return true
            } else {
                return false
            }

        } catch (err) {
            return false
        }
    }
    //update userInfo
    async updateUserInfo(userId, email, fullName, pictureURL) {
        try {
            await this.db.collection("users").doc(userId).update({
                email: email,
                fullName: fullName,

            }).then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }
    //update userRole
    async updateUserRole(userId, role) {
        try {
            await this.db.collection("users").doc(userId).update({
                role: role,
            }).then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }

    //update userBookmark
    async updateUserBookmark(userId, productId) {
        try {
            await this.db.collection("users").doc(userId).update({
                bookmark: admin.firestore.FieldValue.arrayUnion(productId),
            }).then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }
    //delete userBookMark
    async deleteUserBookmark(userId, productId) {
        try {
            await this.db.collection("users").doc(userId).update({
                bookmark: admin.firestore.FieldValue.arrayRemove(productId),
            }).then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }


    //add comment
    async addComment(userId, productId, comment, time) {
        try {
            await this.db.collection("comments").add({
                userId: userId,
                productId,
                comment: comment,
                time: time,

            }).then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }
    ///cart function
    //add to cart
    async addToCart(userId, productId) {
        try {
            await this.db.collection("users").doc(userId).update({
                cart: admin.firestore.FieldValue.arrayUnion({ productId: productId, value: 1 }),
            }).then(() => {
            })
            return true
        } catch (err) {
            return false
        }
    }
    //delete from cart
    async deleteFromCart(userId, productId) {
        try {
            await this.db.collection("users").doc(userId).get().then((data) => {
                data.data().cart.forEach((cartItem) => {
                    if (cartItem.productId == productId) {
                        this.db.collection("users").doc(userId).update({
                            cart: admin.firestore.FieldValue.arrayRemove({ productId: productId, value: cartItem.value }),
                        }).then(() => {
                        })
                    }
                })
            })
            return true
        } catch (err) {
            return false
        }
    }
    //update cart item value

    //make payment
    async makePayment(data, userId) {
        let totalPayment = 0;

        try {
            let dbItems = await (await this.db.collection("items").get());
            let getdbCartItem = [];
            await dbItems.forEach((item) => {
                data.forEach(async (cartItem) => {
                    if (item.id == cartItem.productId) {
                        getdbCartItem.push({ id: item.id, ...item.data() });

                    }
                })
            })
            console.log(getdbCartItem)
            await getdbCartItem.forEach((item) => {
                data.forEach((cartItem) => {
                    console.log(item.id == cartItem.productId)
                    if (item.id == cartItem.productId && item.quantity >= cartItem.value) {

                        totalPayment += (item.price - item.discountPrice) * cartItem.value;
                    } else if (item.id == cartItem.productId && item.quantity < cartItem.value) {
                        throw new Error("Not enough quantity");

                    } else {

                    }
                }
                )

            })


            data.forEach(async (paymentItem) => {
                await this.db.collection("items").doc(paymentItem.productId).update({
                    quantity: admin.firestore.FieldValue.increment(-paymentItem.value),
                    sold: admin.firestore.FieldValue.increment(paymentItem.value),
                })
            })

            await this.db.collection("payments").add({ data }).then(async (payment) => {
                await this.db.collection("users").doc(userId).update({
                    cart: [],
                    orders: admin.firestore.FieldValue.arrayUnion(payment.id),
                })
            })


            return totalPayment;
        } catch (err) {
            return false
        }


    }

}
module.exports = Database