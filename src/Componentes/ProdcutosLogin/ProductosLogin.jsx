import AddProduct from "../Addproducto/AddProducto";
import CreateCategory from "../CrearCategoria/CreateCategory";
import './ProductosLogin.css'
const ProductosLogin = () => {
    return (
        <>

            <div className="container">
                <div className="añadirProductos">
                    <AddProduct />
                </div>
                <div className="Crearcategoria">
                <CreateCategory/>
                </div>
            </div>

        </>
    )
}
export default ProductosLogin;