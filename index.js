const express = require("express");
const {Pool} = require("pg");
require("dotenv").config();
 
const app = express(); //on stocke express dans app
const port = process.env.PORT || 3000;
 
 
 
//Connexion à PostgreSQL
 
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});


 //Création de la table user(à exécuter une seule fois)
 
pool.query(`CREATE TABLE IF NOT EXISTS article(
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    author text
)`)
.then (() => console.log("la table user a bien ete creee ou est deja existante"))
.catch (err => console.error(`une erreur c'est produite lors de la tentative de creation de la table user : ${err}`));



//middleware
app.use(express.json())




//définir nos routes

app.get("/", (req, res)=> { //requete et result
    res.send("Hello world")
});




app.post("/articles", async (req, res) => {
    try {
        const { title, content, author } = req.body;

        // Validation des champs
        if (!title || !content || !author) {
            return res.status(400).json({ message: "Tous les champs (title, content, author) sont requis." });
        }

        const result = await pool.query(
            "INSERT INTO article (title, content, author) VALUES ($1, $2, $3) RETURNING *",
            [title, content, author]
        );
        res.status(201).json(result.rows[0]); 
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Erreur lors de la création de l'article.",
        });
    }
});


app.get("/articles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM article ORDER BY id ASC");
        if (result.rows.length <= 0 || !result.rows) {
            throw new Error("La table article est vide ou inexistante.");
        }
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({
            message: `Une erreur s'est produite lors de la tentative de récupération des données de la table article : ${err}`,
        });
    }
});




app.patch("/articles", async (req, res) => {
    try {
        const { id, title } = req.body;
        const result = await pool.query("UPDATE article SET title = $2 WHERE id = $1 RETURNING *", [id, title]);
        res.status(200).json({
            message: ` l'article a été modifié.`,
            result: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({
            message: `Une erreur s'est produite lors de la mise à jour de l'article : ${err}`,
        });
    }
});

app.delete("/articles", async (req, res) => {
    try {
        const { id } = req.body;
        const result = await pool.query("DELETE FROM article  WHERE id = $1 ", [id]);
        res.status(200).json({
            message: ` l'article a été supprimer.`,
            result: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({
            message: `Une erreur s'est produite lors de la supression de l'article : ${err}`,
        });
    }
});


// on lance le serveur express
 
app.listen(port, () => console.log(`le serveur express est lancé et écoute sur le port ${port}`));