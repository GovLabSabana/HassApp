import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoBack() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(-1);
  }, [navigate]);

  return null;
}