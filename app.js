var express = require ('express');
var mongoose = require ('mongoose');
var bodyParser = require('body-parser');
var multer = require ('multer');
var cloudinary = require('cloudinary');
var method_override = require('method-override')

var uploader = (multer({dest:'./uploads'}));
var app_password="chavez";
cloudinary.config({
	cloud_name: 'lrmaldo', 
  api_key: '392897266261263', 
  api_secret: '8_6PjNirR70DmlEUptcGS5xF8zo' 
});



var app= express();
var midd = uploader.single('imagen_avatar');
 
mongoose.connect('mongodb://localhost/conexiones',{ useMongoClient: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(method_override("_method"));
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

app.get("/admin",function(res,req){	
	req.render("admin/form");
});

app.post("/admin",function(solicitud,respuesta){
	if(solicitud.body.password == app_password){
		Productos.find(function(error,documento){
		if(error){
			console.log(error);
		}else{
			respuesta.render("admin/index",{Pro:documento});
		}
	});
	}else{
		respuesta.redirect("/");
	}
});

//////////////////////////EDITAR//////////////777


app.get("/admin/editar/:id",function(solicitud,respuesta){
	var id_producto = solicitud.params.id;
	Productos.findOne({_id: id_producto},function(error,documento){
		console.log(documento);
		respuesta.render("admin/edit",{Prod:documento});
	});
});

app.put("/admin/:id", midd,function(req,res){
	console.log(req.body.contra);
	if(req.body.contra==app_password){
		 var data={
			 	titulo:req.body.titulo,
			 	descripcion:req.body.descripcion,
			 	precio:req.body.precio
	 		}
	 	
	 		if(req.file){
	 			cloudinary.uploader.upload(req.file.path,
				 function(result) {

				 data.imageUrl = result.url;
				 Productos.update({"_id":req.params.id},data,function(Prod){
				 console.log(result);
				 res.redirect("/productos");
	 			
	 		});
				 
				
					
					
				});

	 		}else{
	 			Productos.update({"_id":req.params.id},data,function(Prod){
	 			res.redirect("/admin");
	 		});

	 		}

	 		

	}else{
		res.render("index");
	}

});



////******************ELIMINAR***************************
app.get("/admin/delete/:id",function(solicitud,respuesta){
	var id_producto = solicitud.params.id;
	Productos.findOne({_id: id_producto},function(error,documento){
		console.log(documento);
		respuesta.render("admin/delete",{Prod:documento});
	});
});
app.delete("/admin/:id",function(req,res){
	console.log(req.body.contra);
	if(req.body.contra == app_password){
		
	 		Productos.remove({"_id":req.params.id},function(err){
	 			res.redirect("/productos");
	 		});

	}else{
		res.redirect("/admin");
	}

});
//**************************************************

//////////////SUBIR IMAGEN E INSERTAR////////////////////

app.get("/productos/new",function(solicitud,respuesta){
	respuesta.render("productos/new");
});

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
		
			if(solicitud.file){

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
				producto.save(function(err){
				 console.log(producto); 
				 respuesta.render("index"); 
				 });

			}
			
		
	}else{
		respuesta.render("productos/new");
	}
 

});

////////////////ELIMINAR///////,



app.listen(8080);
