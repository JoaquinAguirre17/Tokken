import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './CardComponent.css'; // Archivo CSS para los estilos

function CardComponents({ imagen, titulo, texto }) {
  return (
    <Card className="custom-card">
      <Card.Img className="custom-card-img" variant="top" src={imagen} />
      <Card.Body className="custom-card-body">
        <Card.Title className="custom-card-title">{titulo}</Card.Title>
        <Card.Text className="custom-card-text">{texto}</Card.Text>
        <Button className="custom-card-button">Go somewhere</Button>
      </Card.Body>
    </Card>
  );
}

export default CardComponents;
