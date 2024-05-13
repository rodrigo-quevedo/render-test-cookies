const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const fs = require('node:fs')
const {randomBytes} = require('node:crypto')

const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))


//mimic a database 
const db = []

//middleware auth
const isAuthenticated = (req,res, next)=>{
    console.log('Entering isAuthenticated middleware..')
    if (req.cookies.token) { //you need cookie-parser for this to work
        console.log('Cookie saved:')
        console.log(req.cookies)
        console.log(`Token value: ${req.cookies.token}`)

        //auth
        let found = db.find((user)=> user.id === req.cookies.token)
        if (found) next()
        else res.redirect('/login')
    }
    else {
        console.log('Cookie not saved')
        res.redirect('/login')
    }
}

const validateFormData = (req, res, next)=>{
    console.log('Entering validateFormData middleware..')
    console.log(req.body)
    if (!req.body.user || !req.body.password || 
        !/^\w{4,15}$/.test(req.body.user) || !/^\w{4,15}$/.test(req.body.password)
    ) {
        console.log('Invalid data, redirecting to loggin'); 
        res.redirect('/login')
        return;
    } 
    else {
        console.log('Valid data')
        next()
    }
}


app.get("/", (req, res) => {    
    console.log(`GET request on / at ${new Date(Date.now()).toUTCString()}`)

    res.type('text/html').send(fs.readFileSync('./html/home.html'))
})
    

app.get('/login', (req, res)=>{ 
    console.log(`GET request on /login at ${new Date(Date.now()).toUTCString()}`)

    //user is already auth but goes to /login
    if (req.cookies.token) {
        let found = db.find((user)=> user.id === req.cookies.token)
        if (found) res.redirect('/dashboard')
        else req.cookies.token = ''
    }
    
    res.type('text/html').send(fs.readFileSync('./html/login.html'))
})
app.get('/register', (req, res)=>{
    console.log(`GET request on /register at ${new Date(Date.now()).toUTCString()}`)
    res.type('text/html').send(fs.readFileSync('./html/register.html'))
})
app.get('/dashboard', isAuthenticated, (req, res)=>{//isAuthenticated middleware
    console.log(`GET request on /dashboard at ${new Date(Date.now()).toUTCString()}`)
    
    const user = db.find((obj)=>obj.id === req.cookies.token)
    res.type('text/html').send(`<h1>Welcome, ${user.user}</h1><a href='/logout'>Log out</a>`)
})



app.post('/register', validateFormData, (req, res)=>{
    console.log(`POST request on /register at ${new Date(Date.now()).toUTCString()}`)
    console.log(req.body)
    
    //user exists
    if (db.find((obj)=>obj.user === req.body.user)) {
        console.log(`User ${req.body.user} already exist`)
        res.send(`User '${req.body.user}' already exists`)
        return;
    }

    //create user
    let newTokenValue = randomBytes(32).toString('base64url')
    console.log(`New token value: ${newTokenValue}`)
    db.push({
        user: req.body.user,
        password: req.body.password,
        id: newTokenValue
    })

    res.type('text/html').send(fs.readFileSync('./html/register-success.html'))
})

app.post('/login', validateFormData, (req, res)=>{
    console.log(`POST request on /login at ${new Date(Date.now()).toUTCString()}`)
    console.log(req.body)

    //validate credentials
    let userFound = db.find((obj)=>obj.user === req.body.user)
    console.log('db:',db)
    if (userFound && userFound.password === req.body.password) {
        console.log('User found')
        res.cookie('token', userFound.id, {
            maxAge: 1000 * 60 * 60,
        })
        res.redirect('/dashboard')
    }
    //invalid
    else {
        console.log(`Invalid credentials:`, req.body)
        res.type('text/html').send(`<h1>Invalid credentials. <a href='../login'>Try loggin in again</a>`)
    }
})

app.get('/logout', (req, res)=>{
    res.clearCookie('token')
    res.redirect('/login')
})



const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));



//this is the hello world from Render
// server.keepAliveTimeout = 120 * 1000;
// server.headersTimeout = 120 * 1000;

// const html = `
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>Hello from Render!</title>
//     <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
//     <script>
//       setTimeout(() => {
//         confetti({
//           particleCount: 100,
//           spread: 70,
//           origin: { y: 0.6 },
//           disableForReducedMotion: true
//         });
//       }, 500);
//     </script>
//     <style>
//       @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
//       @font-face {
//         font-family: "neo-sans";
//         src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
//         font-style: normal;
//         font-weight: 700;
//       }
//       html {
//         font-family: neo-sans;
//         font-weight: 700;
//         font-size: calc(62rem / 16);
//       }
//       body {
//         background: white;
//       }
//       section {
//         border-radius: 1em;
//         padding: 1em;
//         position: absolute;
//         top: 50%;
//         left: 50%;
//         margin-right: -50%;
//         transform: translate(-50%, -50%);
//       }
//     </style>
//   </head>
//   <body>
//     <section>
//       Hello from Render!
//     </section>
//   </body>
// </html>
// `
