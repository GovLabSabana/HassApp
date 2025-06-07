import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function Account() {
    return (
        <form>
            <Navbar />
            <Sidebar />
          <h1 style={{ textAlign: "center" }}>Cuenta</h1>
        </form>
      );
}