import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function Dashboard() {
    return (
    <form>
        <Navbar />
        <Sidebar />
      <h1 style={{ textAlign: "center" }}>Inicio</h1>
    </form>
  );
}