const {Client, Pool} = require('pg');
const nid = require('nanoid');
const express = require('express');

const app = express();
app.use(express.json());

const dbpassword = 'AsaMitakabeloved';

const pool = new Pool({
    host:'localhost',
    user:'postgres',
    port:5432,
    password: dbpassword,
    database:'shorturl',
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
    allowExitOnIdle: true
});

const port = process.env.PORT ? process.env.PORT : 8080;

function normalizeUrl(input) {
  try {
    return new URL(input).href;
  } catch {
    return new URL(`https://${input}`).href;
  }
}
function isValidUrlString(input) {
  try {
    new URL(
      input.startsWith('http://') || input.startsWith('https://')
        ? input
        : `https://${input}`
    );
    return true;
  } catch {
    return false;
  }
}

app.get('/', async (req, res)=>{
    
})

app.get('/allLinks', async (req, res)=> {
    try{
        result = await pool.query('SELECT * FROM tinyurls');
        if (result.rows.length === 0){
                res.status(204).json({
                    success: true,
                    message: "No entries.",
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: "Here ya go!",
                    data: result.rows
                });
            }
    } catch (error){
        console.log(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        })
    }
});

app.post('/shorten', async (req, res)=>{
    const data = req.body;
    if (data && data.url){
        try {
            if (!isValidUrlString(data.url)) res.status(400).json({
            success: false,
            error: 'Bad request URL.'
        })
            result = await pool.query('INSERT INTO tinyurls(shortened, origin, clicks) VALUES($1, $2, $3) ON CONFLICT (origin) DO NOTHING RETURNING shortened', [ nid.nanoid(), data.url, 0]);
            if (result.rows.length === 0){
                res.status(200).json({
                    success: true,
                    message: "Entry already exists"
                });
            } else {
                res.status(201).json({
                    success: true,
                    message: "New entry created.",
                    shortened: `${req.protocol}://${req.get('host')}/shorten/${result.rows[0].shortened}`
                })
            }
        } catch (error){
            res.status(500).json({
                success: false,
                error: error
            })
        }
    } else {
        res.status(400).json({
            success: false,
            error: 'Incomplete request'
        })
    }
})

app.get('/shorten/:shortened', async (req, res)=>{
    const { shortened } = req.params;

    if (!shortened) {
        
        return res.status(400).json({
        success: false,
        error: 'Incomplete request'
        });
    }

    try {
        const result = await pool.query('SELECT origin FROM tinyurls WHERE shortened = $1',[shortened]);

        if (result.rows.length === 0) {
            
            return res.status(404).json({
                success: false,
                error: 'Shortened URL not found'
            });
        }

        const { origin } = result.rows[0];
        const clickResult = await pool.query('UPDATE tinyurls SET clicks = clicks +1 WHERE shortened = $1 RETURNING clicks', [shortened]);
        console.log(`New click value for ${shortened}: ${clickResult.rows[0].clicks}`);
        res.redirect(302, normalizeUrl(origin));

    } catch (error) {
        console.error('ERROR:', error);
        
        res.status(500).json({
        success: false,
        message: 'Database operation failed'
        });
    }
})

app.put('/shorten/', async (req,res)=>{
    const data = req.body;
    if (data && data.url){
        try {
            const DeleteResult = await pool.query("DELETE FROM tinyurls WHERE origin = $1", [data.url]);
            const updateResult = await pool.query('INSERT INTO tinyurls(shortened, origin, clicks) VALUES($1, $2, $3) ON CONFLICT (origin) DO NOTHING RETURNING shortened', [ nid.nanoid(), data.url, 0]);
            if (updateResult.rows.length === 0){
                res.status(200).json({
                    success: true,
                    message: "New entry updated without deletion?"
                });
            } else {
                res.status(201).json({
                    success: true,
                    message: "Entry Updated",
                    shortened: `${req.protocol}://${req.get('host')}/shorten/${updateResult.rows[0].shortened}`
                })
            }
        } catch(error){
            console.error('ERROR:', error);
            
            res.status(500).json({
            success: false,
            message: 'Database operation failed'
            });
        }
        
    } else {
        res.status(400).json({
            success: false,
            error: 'Incomplete request'
        })
    }
})


app.delete('/shorten/:shortened', async(req, res)=> {
    const {shortened} = req.params;
    if (shortened){
        const result = await pool.query("DELETE FROM tinyurls WHERE shortened = $1 RETURNING origin", [shortened])
        .then((re)=>{
            res.status(204).json({
                success: true,
                message: `Shortened link ${shortened} for deleted.`
            });
        })
        .catch(error => {
            console.error('ERROR:', error);
            
            res.status(500).json({
            success: false,
            message: 'Database operation failed'
            });
        });
    } else {
        res.status(400).json({
            success: false,
            error: 'Incomplete request'
        })
    }
})


app.listen(port, () => {console.log(`Server listening on PORT ${port}`)});
//pool.end();