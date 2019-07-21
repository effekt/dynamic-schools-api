const bcrypt = require('bcrypt');

checkAndCreateUsersTable = async () => {
    const exists = await pool.query(
        `SELECT EXISTS(
            SELECT * 
            FROM information_schema.tables 
            WHERE 
                table_name = 'users'
        );`
    );
    if (!exists.rows[0].exists) {
        await pool.query(
            `CREATE TABLE users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(80) NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password VARCHAR(140) NOT NULL,
                account_type SMALLSERIAL
            )`,
        );
    }
}

checkAndCreateSchoolsTable = async () => {
    const exists = await pool.query(
        `SELECT EXISTS(
            SELECT * 
            FROM information_schema.tables 
            WHERE 
                table_name = 'schools'
        );`
    );
    if (!exists.rows[0].exists) {
        await pool.query(
            `CREATE TABLE schools(
                id SERIAL PRIMARY KEY,
                name VARCHAR(80) NOT NULL,
                about TEXT,
                location TEXT,
                admission TEXT,
                image VARCHAR(240),
                educator_id SERIAL REFERENCES users(id)
            )`
        );
    }
}

checkAndCreateUsers = async () => {
    const exists = await pool.query(
        `SELECT id
        FROM users
        WHERE id = 1`
    );
    if (!exists.rows.length) {
        const passHash = await bcrypt.hash('p@ssw0rd', 2);
        await pool.query(
            `INSERT INTO users (name, email, password, account_type)
            VALUES ($1, $2, $3, $4)`,
            ['Jesse', 'educator1@schools.com', passHash, 1]
        );
        await pool.query(
            `INSERT INTO users (name, email, password, account_type)
            VALUES ($1, $2, $3, $4)`,
            ['Jane', 'educator2@schools.com', passHash, 1]
        );
        await pool.query(
            `INSERT INTO users (name, email, password, account_type)
            VALUES ($1, $2, $3, $4)`,
            ['Bob', 'parent@schools.com', passHash, 0]
        );
    }
}



module.exports = async function() {
    try {
        await checkAndCreateUsersTable();
        await checkAndCreateSchoolsTable();
        await checkAndCreateUsers();
    } catch(err) {
        if (err) console.log(err);
    }
}