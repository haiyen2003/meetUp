import style from '../HomePage/HomePage.module.css'
import mainImage from '../HomePage/HP-online-logo.svg'
import handsUp from '../HomePage/HP-handsUp-logo.svg'
import joinGroup from '../HomePage/HP-joinGroup-logo.svg'
import ticket from '../HomePage/ticket.svg'
import { Redirect, Link, NavLink } from 'react-router-dom';
import { useHistory } from 'react-router-dom';


export default function HomePage() {
    const history = useHistory();
    return (
        <div className={style.mainDiv}>
            <div className={style.container}>
                <div className={style.topDiv}>
                    <div className={style.leftMessage}>
                        <div className={style.mainMessage}><h1> Celebrating 20 years of real connections on Feastup</h1></div>
                        <div className={style.detailMessage}><p>Whatever you’re looking to do this year, Feastup can help. For 20 years, people have turned to Feastup to meet people, make friends, find support, grow a business, and explore their interests. Thousands of events are happening every day—join the fun.</p></div>
                    </div>
                    <div className={style.mainImageCard}>
                        <img className={style.imageCard} src={mainImage} />
                    </div>
                </div>
                <div className={style.middleDiv}>
                    <div className={style.middleTextContainer}>
                        <div className={style.bottomText}>How Feastup works</div>
                        <div className={style.bottomText2}>Meet new people who share your interests through online and in-person events. It’s free to create an account.</div>
                    </div>
                </div>
                <div className={style.bottomDiv}>
                    <div className={style.groups}>
                        <div className={style.subImageCard}>
                            <img className={style.subImageCardleft} src={handsUp} />
                        </div>
                        <Link className={style.link} to='/groups'>
                            <div className={style.subHeading}>Join a group</div></Link>
                        <div className={style.miniText}>Do what you love, meet others who love it, find your community. The rest is history!</div></div>
                    <div className={style.events}>
                        <div className={style.subImageCard}>
                            <img className={style.subImageCardMiddle} src={ticket} />
                        </div>
                        <Link className={style.link} to='/events'>
                            <div className={style.subHeading}>Find an event</div></Link>
                        <div className={style.miniText}>Events are happening on just about any topic you can think of, from online gaming and photography to yoga and hiking.</div>
                    </div>
                    <div className={style.createGroup}>
                        <div className={style.subImageCard}>
                            <img className={style.subImageCardRight} src={joinGroup} />
                        </div>
                        <Link className={style.link} to='/groups/new'>
                            <div className={style.subHeading}>Start a group</div></Link>
                        <div className={style.miniText}>You don’t have to be an expert to gather people together and explore shared interests.</div>
                    </div>
                </div>
                <div>
                    <button onClick={()=>history.push("/signup")} className = {style.button} to='/signup'>
                        Join Feastup
                    </button>
                </div>
            </div>
        </div>
    )
}
