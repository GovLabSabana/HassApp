import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function Production() {
    return (
        <form>
            <Navbar />
            <Sidebar />
          <h1 style={{ textAlign: "center" }}>Producción</h1>
        </form>
      );
}