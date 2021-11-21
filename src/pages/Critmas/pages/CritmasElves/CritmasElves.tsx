import React from 'react';
import NameCloud from './componets/NameCloud';
import {Card, CardImg, Carousel, Col, Container, Row} from 'react-bootstrap';

import imgElfToyMaker from 'assets/images/critmas/elves/toymaker.webp';
import imgElfSecurity from 'assets/images/critmas/elves/security.webp';
import {Link} from 'react-router-dom';
import ElfToyMaker from './componets/ElfToyMaker';
import ElfSecurity from './componets/ElfSecurity';
import ElfStable from './componets/ElfStable';
import ElfLumberJack from './componets/ElfLumberJack';
import ElfTechie from './componets/ElfTechie';
import ElfSpy from './componets/ElfSpy';
import ElfMore from './componets/ElfMore';

function CritmasElves() {
    return (
        <Container className="bg-light" as="main">
            <Row>
                <Col>
                    <h4>Welcome to the Christmas Dungeons & Dragons One-Shot adventure!</h4>

                    <p>Oh happy days!</p>
                    <p>
                        It's that time of year again, all over the world little children are heading to bed dreaming
                        of toy wonderlands and promises of joys of a white christmas.
                        As the world goes quiet in anticipation the North Pole is full of action as the final
                        preparations are being made.
                    </p>

                    <p>
                        It's nearly go time for Santa and his elves, nothing can go wrong now surely?
                    </p>

                    <hr/>

                    <h4 id="YourElf">Role-playing Santa's Elves</h4>
                    <p>
                        In this festive one-shot you will be playing as one of Santa's Elves
                    </p>

                    <p>
                        With their small and somewhat squat build, Christmas elves appear to be young children.
                        But they're varied, skilled and reliable, only the best can work at the Grotto after all.
                    </p>

                    <Card className="callout">
                        <Card.Body>
                            Last Christmas we played serious, more traditional D&D characters. This year I'd like you to
                            get inventive. You will be limited to choosing the&nbsp;
                            <a href="https://www.dndbeyond.com/races/830434-christmas-elf"
                               title="Santa's Elves Race details | dndbeyond.com"
                            >Christmas Elf Race</a>.
                            But that is where the limitation ends. Have fun making the most delightful/grumpy/anxious/brave elf you can come up with.
                        </Card.Body>
                    </Card>

                    <p>
                        Below are some pointers of inspiration to get you going!
                    </p>

                    <p>
                        <small>
                            Already know who you're creating?
                            Jump ahead and start making <Link to="guide">here</Link>.
                        </small>
                    </p>
                </Col>
            </Row>
            <Row>
                <Col>

                    <h5>Your Elf</h5>
                    <p>Some might think that all elves are two a penny, toy makers the lot of them.</p>

                    <p>
                        But this could not be further from the truth. While it's true the majority of elves are
                        christmas fanatics, they do not all make and wrap toys, there is a whole operation to run
                        here in the North Pole and elves are just as varied as any other race.
                    </p>

                    <Card className="callout">
                        <Card.Body>
                            You are encouraged to come up with your own Christmas Elf. How do they contribute to delivering Christmas every year?
                            I've included some ideas to play with, but you are not limited to them, feel free to come up with your own.
                            <br/>
                            <br/>
                            The type you pick does not limit your class in anyway, its just to help fill in your background.
                        </Card.Body>
                    </Card>

                    <h5>Elf Names</h5>
                    <p>
                        Elves have very Christmassy names that make little sense but show their childish nature.
                        Examples might include:

                        <NameCloud />

                        Go crazy, but if you need some more inspiration try a generator like this one:&nbsp;
                        <a
                            href="https://www.fantasynamegenerators.com/christmas-elf-names.php"
                            title="Christmas Elf names | fantasynamegenerators.com"
                            target="_blank"
                        >fantasynamegenerators.com.</a>
                    </p>

                    <h5>Outfitting your elf</h5>
                    <p>
                        We've obviously going to be using equipment available in D&D to equip our elves.
                        But swords are boring!
                    </p>

                    <p>
                        You don't have a couple of rapiers; <span className="text-primary">you dual wield sharpened candy canes!</span>
                    </p>

                    <p>
                        That crossbow; <span className="text-secondary">you built yourself out of Lego!</span>
                    </p>

                    <p>What and how you got it is up to you, looking for the ridiculous.</p>
                </Col>
                <Col
                    lg="4"
                    md="5"
                    sm="6"
                    xs="12"
                >

                    <Carousel className="elf-jobs">
                        <Carousel.Item>
                            <ElfToyMaker />
                        </Carousel.Item>

                        <Carousel.Item>
                            <ElfSecurity />
                        </Carousel.Item>

                        <Carousel.Item>
                            <ElfStable />
                        </Carousel.Item>

                        <Carousel.Item>
                            <ElfLumberJack />
                        </Carousel.Item>

                        <Carousel.Item>
                            <ElfTechie />
                        </Carousel.Item>

                        <Carousel.Item>
                            <ElfSpy />
                        </Carousel.Item>
                        
                        <Carousel.Item>
                            <ElfMore />
                        </Carousel.Item>
                    </Carousel>
                </Col>
            </Row>
            <Row>
                <Col className="text-center">
                    <p>Ready to make your elf?  Let's get started:</p>

                    <Link to="guide" className="btn btn-primary mb-4">Build an Elf Workshop</Link>
                </Col>
            </Row>
        </Container>
    );
}

export default CritmasElves;
