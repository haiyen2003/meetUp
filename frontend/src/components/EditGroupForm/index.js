// // frontend/src/components/EditGroup/index.js
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useHistory } from 'react-router-dom';
// //import group from '../../../../backend/db/models/group';
// import { editGroupThunk } from '../../store/group';
// import { fetchOneGroup } from '../../store/group';
// import { useParams } from 'react-router-dom';
// import '../EditGroupForm/EditGroup.css';
// //extract params to find groupId - normalize data in Redux;

// export default function EditGroupForm() {
//     const { groupId } = useParams();
//     const group = useSelector((state) => state.groups[groupId]);
//     //console.log('THIS IS GROUP CITY', group.city);
//     // console.log(group[groupId], 'THIS IS GROUP');
//     const sessionUser = useSelector((state) => state.session.user);

//     const history = useHistory();
//     const dispatch = useDispatch();
//     const [name, setName] = useState(group && group.name);
//     const [about, setAbout] = useState(group && group.about);
//     const [type, setType] = useState(group && group.type);
//     const [city, setCity] = useState(group && group.city);
//     const [state, setState] = useState(group && group.state);
//     const [isPrivate, setPrivate] = useState(group && group.private);
//     const [previewImage, setPreviewImage] = useState(group && group.previewImage);
//     const [errors, setErrors] = useState([]);
//     const [submitted, setSubmitted] = useState(false);

//     //this help get the data from the previous group (before editing);
//     useEffect(() => {
//         dispatch(fetchOneGroup(groupId))
//     }, [dispatch, groupId]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setErrors([]);
//         setSubmitted(true);
//         const thisEditGroupPayload = {
//             name: name,
//             about: about,
//             type: type,
//             private: isPrivate,
//             city: city,
//             state: state
//         };
//         // const thisEditGroup = await dispatch(editGroupThunk(groupId, thisEditGroupPayload));
//         // console.log(thisEditGroup, 'THIS EDIT GROUP');
//         // //const thisGroup = await dispatch(fetchOneGroup(groupId));
//         // history.push(`/groups/${groupId}`);
//         return dispatch(editGroupThunk(groupId, thisEditGroupPayload))
//             .then(() => {
//                 history.push(`/groups/${groupId}`);
//             })
//             .catch(async (res) => {
//                 const data = await res.json();
//                 if (data && data.errors) {
//                     setErrors(data.errors);
//                 }
//             })
//     }

//     if (!group) return null;
//     return (
//         <>
//             <div className='form'>
//                 <div className='title-div'>
//                     <div className='top-title'>Edit your group</div>
//                     <div className='name-details'>{group.name}</div>
//                 </div>
//                 <form onSubmit={handleSubmit}>
//                     <ul className='error'>
//                         {errors.map((error, idx) => <li key={idx}>{error}</li>)}
//                     </ul>
//                     <div className='top-field'>
//                         <div className='field'>
//                             <label className='label'>Name</label>
//                             <input
//                                 className='input-box'
//                                 type='text'
//                                 value={name}
//                                 onChange={e => setName(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className='field'>
//                             <label className='label'>About</label>
//                             <input
//                                 className='input-box'
//                                 type='text'
//                                 value={about}
//                                 onChange={e => setAbout(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className='field'>
//                             <label className='label'>Type</label>
//                             <select
//                                 className='edit-group-select'
//                                 value={type}
//                                 onChange={e => setType(e.target.value)}
//                                 required
//                             >
//                                 <option className='edit-group-select' value={'In person'}>In person</option>
//                                 <option className='edit-group-select' value={'Online'}>Online</option>
//                             </select>
//                         </div>
//                         <div className='field'>
//                             <label className='label'>City</label>
//                             <input
//                                 className='input-box'
//                                 type='text'
//                                 value={city}
//                                 onChange={e => setCity(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className='field'>
//                             <label className='label'>State</label>
//                             <input
//                                 className='input-box'
//                                 type='text'
//                                 value={state}
//                                 onChange={e => setState(e.target.value)}
//                                 required
//                             >
//                             </input>
//                         </div>
//                         <div className='field'>
//                             <label className='label'>Group Privacy</label>
//                             <select
//                                 className='edit-group-select'
//                                 type='text'
//                                 value={isPrivate}
//                                 onChange={e => setPrivate(e.target.value)}
//                                 required
//                             >
//                                 <option className='edit-group-select' value={true}>Private</option>
//                                 <option className='edit-group-select' value={false}>Public</option>
//                             </select>
//                         </div>
//                         <div className='field'>
//                             <label className='label'>Preview Image</label>
//                             <input
//                                 className='input-box'
//                                 type='text'
//                                 value={previewImage}
//                                 onChange={e => setPreviewImage(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                     <button className='button-edit-group' type='submit'>
//                         Submit
//                     </button>
//                 </form>
//             </div>
//         </>
//     )
// }

// frontend/src/components/EditGroup/index.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
//import group from '../../../../backend/db/models/group';
import { editGroupThunk } from '../../store/group';
import { fetchOneGroup } from '../../store/group';
import { useParams } from 'react-router-dom';
import '../EditGroupForm/EditGroup.css';
//extract params to find groupId - normalize data in Redux;

export default function EditGroupForm() {
    const { groupId } = useParams();
    const group = useSelector((state) => state.groups[groupId]);
    //console.log('THIS IS GROUP CITY', group.city);
    // console.log(group[groupId], 'THIS IS GROUP');
    const sessionUser = useSelector((state) => state.session.user);

    const history = useHistory();
    const dispatch = useDispatch();
    const [name, setName] = useState(group && group.name);
    const [about, setAbout] = useState(group && group.about);
    const [type, setType] = useState(group && group.type);
    const [city, setCity] = useState(group && group.city);
    const [state, setState] = useState(group && group.state);
    const [isPrivate, setPrivate] = useState(group && group.private);
    const [errors, setErrors] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    //this help get the data from the previous group (before editing);
    useEffect(() => {
        dispatch(fetchOneGroup(groupId))
    }, [dispatch, groupId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSubmitted(true);
        const thisEditGroupPayload = {
            name: name,
            about: about,
            type: type,
            private: isPrivate,
            city: city,
            state: state
        };
        // const thisEditGroup = await dispatch(editGroupThunk(groupId, thisEditGroupPayload));
        // console.log(thisEditGroup, 'THIS EDIT GROUP');
        // //const thisGroup = await dispatch(fetchOneGroup(groupId));
        // history.push(`/groups/${groupId}`);
        return dispatch(editGroupThunk(groupId, thisEditGroupPayload))
            .then(() => {
                history.push(`/groups/${groupId}`);
            })
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            })
    }

    if (!group) return null;
    return (
        <>
            <div className='form'>
                <div className='title-div'>
                    <div className='top-title'>Edit your group</div>
                    <div className='name-details'>{group.name}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    <ul className='error'>
                        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                    <div className='top-field'>
                        <div className='field'>
                            <label className='label'>Name</label>
                            <input
                                className='input-box'
                                type='text'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>About</label>
                            <input
                                className='input-box'
                                type='text'
                                value={about}
                                onChange={e => setAbout(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>Type</label>
                            <select
                                  className = 'dropdown-option'
                                value={type}
                                onChange={e => setType(e.target.value)}
                                required
                            >
                                <option   className = 'dropdown-option' value={'In person'}>In person</option>
                                <option   className = 'dropdown-option' value={'Online'}>Online</option>
                            </select>
                        </div>
                        <div className='field'>
                            <label className='label'>City</label>
                            <input
                                className='input-box'
                                type='text'
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>State</label>
                            <input
                                className='input-box'
                                type='text'
                                value={state}
                                onChange={e => setState(e.target.value)}
                                required
                            >
                            </input>
                        </div>
                        <div className='field'>
                            <label className='label'>Group Privacy</label>
                            <select
                                className = 'dropdown-option'
                                type='text'
                                value={isPrivate}
                                onChange={e => setPrivate(e.target.value)}
                                required
                            >
                                <option className='input-box' value={true}>Private</option>
                                <option className='input-box' value={false}>Public</option>
                            </select>
                        </div>
                    </div>
                    <button className='button' type='submit'>
                        Submit
                    </button>
                </form>
            </div>
        </>
    )
}
