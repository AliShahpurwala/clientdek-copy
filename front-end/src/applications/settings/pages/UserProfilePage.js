import React, { useContext, useEffect, useState, useCallback } from "react";
import InputForm from "../../../components/InputForm";
import { formatAPIKey } from "../../../utils/ClientdekUtils";
import { MdAccountCircle } from "react-icons/md";
import { CookieContext, ProfilePictureContext } from "../../../components/Clientdek";
import apiHandler from "../../../utils/ApiHandler";
import UploadPopup from "../../../components/popups/UploadPopup";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import { RenderClientdekContext } from "../../../components/Clientdek";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
export default function UserProfilePage() {

	const [previewSrc, setPreviewSrc] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
    const [userProfile, setUserProfile] = useState({});
    const { imageSource, setImageSource } = useContext(ProfilePictureContext);
    const [imageFound, setImageFound] = useState(imageSource != undefined);
    const [showImageUploadForm, setShowImageUploadForm] = useState(false);
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
    const cookie = useContext(CookieContext);

	const { showSnackBar } = useSnackBarContext();
	const { renderClientdek, setRenderClientdek } = useContext(RenderClientdekContext);
	
    const onImageUpload = async (e) => {
		e.preventDefault();
        
		const formData = new FormData();
		formData.append("image_file", selectedFile);
		formData.append("user_id", cookie.user_id);
		var response = await apiHandler.post(`/images/upload-image`,formData);
		if (response.status === 201) {
			setShowImageUploadForm(false);
            setPreviewSrc(null);
            setImageFound(false);
			setRenderClientdek(!renderClientdek);
			showSnackBar(`Successfully uploaded ${selectedFile.name}`, "INFO");
		}
	}

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		setSelectedFile(file);
		const reader = new FileReader();

		reader.addEventListener('load', () => {
			setPreviewSrc(reader.result);
		});

		reader.readAsDataURL(file);
	};
 
    const userProfilePopulate = useCallback(async () => {
      try {
        const response = await apiHandler.get(`/users/${cookie["user_id"]}`);
        var responseValue = response.data;
        delete responseValue.company_id;
        delete responseValue.account_status;
        delete responseValue.image_link;
        delete responseValue.admin_status;
        Object.keys(responseValue).map((key) => {
            if (responseValue[key] === null) {
                responseValue[key] = undefined;
            }
            return key;
        });
        setUserProfile(responseValue);
      } catch (error) {
        console.error(error);
      }
    }, [cookie]);
    
    const userProfileUpdate = async () => {
        var userProfilePreProcessing = JSON.parse(JSON.stringify(userProfile));
        Object.keys(userProfilePreProcessing).map(
            (key) => {
                if (userProfilePreProcessing[key] === "") {
                    userProfilePreProcessing[key] = null;
                }
                return key;
            }
        );
        await apiHandler.put(`/users/${cookie.user_id}`, userProfilePreProcessing);
        setSaveButtonDisabled(true);
    };

    const userProfilePictureUpdate = useCallback(async () => {
        if (cookie.user_id === undefined) {
            return;
        }
        try {
          const response = await apiHandler.get(`/users/${cookie.user_id}/profile-image`, {
            responseType: 'blob'
          });
          var responseValue = response.data;
          const imgRegex = new RegExp("image/*");
          if (responseValue.type.match(imgRegex)) {
            setImageFound(true);
            setImageSource(URL.createObjectURL(responseValue));
          } else {
            setImageFound(false);
            setImageSource(undefined);
          }
        } catch (error) {
          console.error(error);
        }
      }, [cookie.user_id]);

    useEffect(() => { userProfilePopulate(); userProfilePictureUpdate(); }, [cookie, userProfilePictureUpdate, userProfilePopulate])

    //function to handle text input in popup
    const handleText = (event) => {
        setUserProfile({ ...userProfile, [event.target.name]: event.target.value });
        setSaveButtonDisabled(false);
    };

    return (
        <div>
            <div onClick={() => { setShowImageUploadForm(true); }}>
                {imageFound
                    ? <img src={imageSource} className="p-1.5 h-[90px] rounded-full aspect-square" alt="Your Profile Img" />
                    : <MdAccountCircle className="text-8xl text-on-surface-variant dark:text-on-surface-variant-dark" />
                }
            </div>
            {Object.keys(userProfile).map((key) => {
                if (userProfile[key] === "" || userProfile[key] === undefined) {
                    return (<InputForm key={key} name={key} value={""} placeholder={"Add " + formatAPIKey(key)} handleText={handleText} />)
                }
                if (key.includes("_id")) {
                    return (<InputForm key={key} name={key} value={userProfile[key]} handleText={handleText} isDisabled={true} />)
                }
                return (<InputForm key={key} name={key} value={userProfile[key]} handleText={handleText} />)
            })}
            <UploadPopup
                show={showImageUploadForm}
                close={() => { setShowImageUploadForm(false); setPreviewSrc(null); }}
                upload={onImageUpload}
                title="Upload New Profile Image"
                body={
                    <div>
                        <form className="flex flex-col items-center" encType="multipart/form-data">
                            <label htmlFor="image" className="w-full mb-2 text-lg font-medium">
                                Choose an image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                className="mb-4"
                                onChange={handleImageUpload}
                            />
                            {previewSrc && (
                                <img
                                    src={previewSrc}
                                    alt="Preview"
                                    className="mb-4 w-64 h-64"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            )}
                        </form>
                    </div>
                }
            />
            <SecondaryButton enabled={!saveButtonDisabled} text="Save" onClick={userProfileUpdate} />
        </div>
    )
}