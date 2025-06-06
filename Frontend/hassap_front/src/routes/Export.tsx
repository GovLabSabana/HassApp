import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function Export() {
    return (
        <form>
            <Navbar />
            <Sidebar />
          <h1 style={{ textAlign: "center" }}>Exportación</h1>
        </form>
      );
}