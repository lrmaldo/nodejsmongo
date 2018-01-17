var express = require ('express');
var mongoose = require ('mongoose');
var bodyParser = require('body-parser');
var multer = require ('multer');
var cloudinary = require('cloudinary');

var uploader = (multer({dest:'./uploads'}));

cloudinary.config({
	cloud_name: 'lrmaldo', 
  api_key: '392897266261263', 
  api_secret: '8_6PjNirR70DmlEUptcGS5xF8zo' 
});



var app= express();
 
mongoose.connect('mongodb://localhost/conexiones',{ useMongoClient: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//app.use(multer({dest: "./uploads"}));
 app.set("view engine","jade");

//esquema de   productos en mongo
var productoSchema ={
	titulo:String,
	descripcion:String,
	imageUrl:String,
	precio: Number
}
var Productos = mongoose.model("Productos",productoSchema);

 app.use(express.static("public"));

app.get("/",function(req,res){


res.render('index');

});
app.get("/productos",function(req,res){
	Productos.find(function(error,documento){
		if(error){
			console.log(error);
		}else{
			res.render("productos/index",{Pro:documento});
		}
	});
	
	
});


var midd = uploader.single('imagen_avatar');

app.post("/productos",midd,function(solicitud,respuesta){
	//console.log(solicitud.body);
	//guardar datos desde index en mongodb
	
	//console.log(solicitud.file);
	 var data={
			 	titulo:solicitud.body.titulo,
			 	descripcion:solicitud.body.descripcion,
			 	precio:solicitud.body.precio
	 		}
	var producto = new Productos(data);
	if(solicitud.body.contraseña=="chavez"){
		
			cloudinary.uploader.upload(solicitud.file.path,
			 function(result) {

			 producto.imageUrl = result.url;
			 producto.save(function(err){
				 	console.log("mongodb: "+producto);
				});

				console.log(result) 
				
				
			});

		
			 
			 
			 	

		respuesta.render("index");
		
	}else{
		respuesta.render("productos/new");
	}
 

});
app.get("/productos/new",function(req,res){
	res.render("productos/new");
});
app.listen(8080);
