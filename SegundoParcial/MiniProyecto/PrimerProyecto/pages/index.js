import Link from "next/link";
import link from "next/link";
export default function Home(){
    return(
        <main>
            <h1>Ejemplo de miniproyecto con Next</h1>
            <p>
                <Link >Ir a /practica/1 como una ruta dinámica</Link>
            </p>
        </main>
    )
}