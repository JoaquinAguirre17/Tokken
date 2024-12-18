import Carousel from 'react-bootstrap/Carousel';
import './carousel.css'


function Carousel1() {
    return (
        <Carousel className='carouselGeneral'>
            <Carousel.Item>
                <img className="imagenCarousel" src="/img/carrusel1.png"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img src="/img/carrusel2.png" alt="" />
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img src="/img/carrusel3.png" alt="" />
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
}

export default Carousel1;