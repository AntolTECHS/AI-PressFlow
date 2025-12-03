import Article from "../models/Article.js";
import User from "../models/User.js";

/* ----------------------------------------------
   ARTICLES
----------------------------------------------*/

// GET /api/admin/articles/approved → Admin sees approved articles ready to publish
export const getApprovedArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "approved" }).sort({ createdAt: 1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/admin/articles/:id/publish → Admin publishes an approved article
export const publishArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.status !== "approved") {
      return res.status(400).json({ message: "Only approved articles can be published" });
    }

    article.status = "published";
    article.pubDate = new Date();

    await article.save();
    res.json({ message: "Article published successfully", article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------
   USERS
----------------------------------------------*/

// GET /api/admin/users → Admin sees all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/admin/users/:id → Admin deletes a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PATCH /api/admin/users/:id → Admin updates a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user.id === id) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (!["journalist", "editor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
