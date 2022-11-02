const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});

app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine','ejs');

//const bcrypt = require('bcryptjs');

const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


const connection = require('./database/db');

	app.get('/login',(req, res)=>{
		res.render('login');
	})

	app.get('/register',(req, res)=>{
		res.render('register');
	})

app.post('/register', async (req, res)=>{
	const name = req.body.name;
	const email = req.body.email;
    const dir = req.body.dir;
	const pass = req.body.pass;
	//let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{name:name, email:email, dir:dir, pass:pass}, (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Regristro",
				alertMessage: "¡Registro Exitoso!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});      
        }
	});
})

app.post('/auth', async (req, res)=> {
	const email = req.body.email;
	const pass = req.body.pass;    
    //let passwordHash = await bcrypt.hash(pass, 8);
	console.log(req.body)
	if (email && pass) {
		connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results)=> {
			if( results.length == 0 || (results[0].pass != pass)) {   
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
						
			} else {         
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});


app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/')
	})
});


app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});