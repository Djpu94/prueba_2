var express = require('express');
var router = express.Router();

var Connection = require('tedious').Connection
var Request = require('tedious').Request
var config = {
  server: "10.7.0.13", // or "localhost"
  options: {},
  authentication: {
    type: "default",
    options: {  
      userName: "usr_prueba",
      password: "Pf123456",
    }
  },
  options:{
    encrypt: false,
    database: 'AdventureWorks2017',
    trustServerCertificate: true,
    port: 64573
  }
};

router.get('/', function(req, res, next) {
  res.render('direccionesPost', {title:'registro de direcciones'});
});

/* GET users listing. */
router.post('/', function(req, res, next) {
  var connection = new Connection(config)

  connection.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      executeSQL();
    }
  })

  function executeSQL(){

    let sql = "insert into [Person].[Address] (AddressID, AddressLine1, AddressLine2, City, StateProvinceID, PostalCode) values ("; 
    sql=sql+" '"+req.body.AddressID+"','"+req.body.AddressLine1+"','"+req.body.AddressLine2+"','"+req.body.City+"','"+req.body.StateProvinceID+"','"+req.body.PostalCode+"');"
    request = new Request(sql, (err, rowCount) => {
      if (err) {
        res.send(err);
      } else {
        res.send("Direccion agregado correctamente")
      }
      connection.close()
    })
    connection.execSql(request)
  }
});

router.get('/lista', function(req, res, next) {
  var connection = new Connection(config);

  connection.connect((err) => {
    if (err) {
      console.log('Connection Failed');
      throw err;
    }
    executeStatement();
  });

  function executeStatement() {
    const query = "SELECT TOP (5) AddressID, AddressLine1, AddressLine2, City, StateProvinceID, PostalCode FROM [Person].[Address] FOR JSON AUTO"

    const request = new Request(query, (err, rowCount) => {
      if (err) {
        throw err;
      }
  
      console.log('DONE!');
      connection.close();
    });
  
    // Emits a 'DoneInProc' event when completed.
    request.on('row', (direcciones) => {
      direcciones.forEach((direccion) => {
        if (direccion.value === null) {
          console.log('NULL');
        } else {
          res.render("direcciones", {title: 'Direcciones del Sistema', direcciones: JSON.parse(direccion.value)});
        }
      });
    });
  
    request.on('done', (rowCount) => {
      console.log('Done is called!');
    });
  
    request.on('doneInProc', (rowCount, more) => {
      console.log(rowCount + ' rows returned');
    });
  
    connection.execSql(request);
  }
});

module.exports = router;