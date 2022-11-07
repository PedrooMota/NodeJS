const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const conexao = mysql.createConnection({host: "localhost", user: "root",
password:"", database: "teste"});
const Filter = require('bad-words');
const filter = new Filter();

const session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'asddsadasdaas'
 
}))

/////Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());




//principal==========================================================
app.get('/', function(req, res){
    res.sendFile(__dirname+"/salas.html")
})

/////// Desconectar ///////////
app.get('/logout', function(req, res){
    res.sendFile(__dirname+"/login.html")
})

///////////////Cadastro////////////////

app.get("/cadastro", function(req,res){
    res.sendFile(__dirname + "/cadastro.html");
});
app.post("/cadastroC", function(req,res){
    let nome = req.body.txtNome;
    let email = req.body.txtEmail;
    let senha = req.body.txtSenha;
    let user = req.body.txtUser;

    sql = `SELECT email from login WHERE email='${email}'`
    conexao.query(sql, function(err, result){
        if(result == ""){
            let v = `('${nome}', '${user}', '${email}', '${senha}' )`
            sql = `INSERT INTO login (nome_user,user,email,senha) VALUES ${v} `
            conexao.query(sql, function(){
            })
            //===
            let sql1 = `SELECT * FROM login WHERE email='${email}'`
            conexao.query(sql1, function(err, result, fields){
                req.session.usuario = result[0].id                 
                res.redirect('/')
            })
        }else{
            res.redirect('/cadastro')
        }
    })
    
});

//login==========================================================
app.get('/login', function(req, res){
    res.sendFile(__dirname+"/login.html")
})

app.post("/loginC", function(req,res){
    let userLog = req.body.txtUser;
    let senhaLog = req.body.txtSenha;

    let sqlLog = `SELECT * FROM login WHERE user='${userLog}' AND senha='${senhaLog}'` 
    conexao.query(sqlLog,function(err,result,fields){
        // console.log(result)
        req.session.usuario = result[0].id       
        // req.session.usuario = `${result[0].id_usu}`
        res.redirect('/')
    })
    });

/////Criar Salas////////////
app.post("/criarsalaC", function(req,res){
    let nomeSala = req.body.sala;
    let descricaoSala = req.body.descricao;
    let sql = `INSERT INTO salas (nomesalas, descricaosalas, id_user) VALUES('${nomeSala}','${descricaoSala}', ${req.session.usuario})`
    conexao.query(sql, function(err, result){
        
        res.redirect('/')
    })
});

app.get("/sala", function(req,res){

    let sql = `select * from salas, login where salas.id_user = login.id;`;
    let json = { sucess: '', info: [], erro: '' };
    conexao.query(sql,function(err,result,fields){
        json.sucess = true;
        for(x in result){
            json.info.push({
                idsala: result[x].idsalas,
                nome: result[x].nomesalas,
                desc: result[x].descricaosalas,
                id_user: result[x].id_user,
                nome_user: result[x].nome_user

              
            });
        }
        res.json(json);
    });
    
});
/////// mensagens /////////


app.post("/menssagens", function(req,res){
    let msg = req.body.mensagem
    let data = new Date();
    let dia = data.getDate().toString().padStart(2,'0');
    let mes = (data.getMonth()+1).toString().padStart(2,'0');
    let ano = data.getFullYear();
    let dia_atual = `${dia}/${mes}/${ano}`
    msg = msg.replace("buceta", "*").replace("merda", "*").replace("porra","*").replace("caralho","*").replace("crl","*").replace("krl","*").replace("filha da puta","*").replace("filho da puta","*").replace("puta","*").replace("arrombado", "*").replace("cuzao", "*").replace("cuzão", "*");
    let values = [msg,id_sala,req.session.usuario, dia_atual,0];
    let sql = `insert into mensagem values (default,?,?,?,?,?)`

    conexao.query(sql,values);
});

///////// MOSTRAR MENSAGENS ///////////
app.get("/mostrarMsg", function(req,res){
    let sql = `select textomsg, id_user, nome_user, data, idmensagem from mensagem, login where mensagem.id_user = login.id and id_sala = '${id_sala}'`
    let json2 = { sucess: '', info: [], erro: '' };
    conexao.query(sql,function(err,result,fields){
        json2.sucess = true;
        for(x in result){
            json2.info.push({
                msg: result[x].textomsg,
                // iduser: result[x].id_user,
                user: result[x].nome_user,
                data: result[x].data,
                id_msg: result[x].idmensagem
            });
        }
        res.json(json2);
        
    });
});
app.get("/sala/id:id", function(req,res){
    id_sala = req.params.id;
    res.sendFile(__dirname + "/msg.html");
});

app.post("/pesquisarSala", function(req,res){
    
    let nome_sala = req.body.txtsala;
    let sql = `select idsalas from salas where nomesalas = '${nome_sala}'`;
    let json = { sucess: '', info: [], erro: '' };
    conexao.query(sql,function(err,result,fields){
        console.log(result[0].idsalas)
        res.redirect("/sala/id"+result[0].idsalas);
       
    });
    
});
/////// Curtidas //////////
app.get("/curtidas/:idmsg",function(req,res){
    let id_msg = req.params.idmsg;
    
    let sql = `update mensagem set likes = likes+1 where idmensagem = ${id_msg}`;
    conexao.query(sql,function(err,result,fields){
       res.redirect("/ranque")
        
    });

});
app.get("/maiscurtidas", function(req,res){
    let sql = `select * from mensagem, login order by likes desc`
    let json = { sucess: '', info: [], erro: '' };
    conexao.query(sql,function(err,result,fields){
        json.sucess = true;
        for(x in result){
            json.info.push({
                likes: result[x].likes,
                msg: result[x].textomsg,
                user: result[x].nome_user,
                data: result[x].data
            });
        }
        res.json(json);
        
    });
});
app.get("/ranque",function(req,res){
    res.sendFile(__dirname + "/maislikes.html");
});

app.get("/salas", function(req,res){
    res.sendFile(__dirname + "/salas.html");
});
app.listen(8080, function(){
    console.log('http://localhost:8080/cadastro')
});