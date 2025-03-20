import Carousel from 'react-bootstrap/Carousel';
import './carousel.css'


function Carousel1() {
    return (
        <Carousel className='carouselGeneral'>
            <Carousel.Item>
                <img  src="/img/PC/1.jpg" className="imagen-grande"/>
                <img  src="/img/Movil/1.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img  src="/img/PC/2.jpg" className="imagen-grande"/>
                <img  src="/img/Movil/2.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img  src="/img/PC/3.jpg" className="imagen-grande"/>
            <img  src="/img/Movil/3.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img  src="/img/PC/4.jpg" className="imagen-grande"/>
                <img  src="/img/Movil/4.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img  src="/img/PC/5.jpg" className="imagen-grande"/>
            <img  src="/img/Movil/5.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img  src="/img/PC/6.jpg" className="imagen-grande"/>
            <img  src="/img/Movil/6.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
            <img  src="/img/PC/7.jpg" className="imagen-grande"/>
            <img  src="/img/Movil/7.jpg" className="imagen-chica"/>
                <Carousel.Caption>
                    
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
}

export default Carousel1;