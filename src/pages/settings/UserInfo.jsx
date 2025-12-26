import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { BiEditAlt } from "react-icons/bi";
import Button from "../../UI/Button";
import InputField from "../../UI/InputField";
import DropZone from "../../UI/DropZone";
import { TbPhoto } from "react-icons/tb";
import { updateUserInfo } from "../../store/slices/user";
import Select from "../../UI/Select";

const UserInfo = () => {
  const dispatch = useDispatch();
  const { auth_user, is_loading } = useSelector((state) => state.user);
  const [editable, setEditable] = useState(false);
  const [profile, setProfile] = useState("");
  useEffect(() => {
    setProfile(auth_user?.avatar);
  }, [auth_user]);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("User name is required."),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: auth_user?._id,
      username: auth_user?.username,
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(
        updateUserInfo(values.id, {
          username: values.username,
        })
      );
      setEditable(false);
    },
  });

  const userInfoLowerList = [];

  return (
    <div className="bg-white dark:bg-blue-950 rounded-lg px-4 py-6 md:p-6">
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {!editable ? (
          <h4 className="font-bold dark:text-white">User Info</h4>
        ) : (
          <h4 className="font-bold dark:text-white">Edit User Info</h4>
        )}
        {!editable && (
          <button
            className="cursor-pointer"
            type="button"
            onClick={() => setEditable(true)}
          >
            <BiEditAlt fontSize={24} color="#161925" />
          </button>
        )}
        {editable && (
          <div className="lg:flex items-center space-x-3 hidden">
            <Button
              size="sm"
              value="Save"
              isLoading={is_loading}
              disabled={!formik.isValid}
              onClick={formik.submitForm}
            />
            <Button
              size="sm"
              value="Cancel"
              isLoading={is_loading}
              variant="white"
              onClick={() => {
                formik.resetForm();
                setProfile(auth_user.avatar);
                setEditable(false);
              }}
            />
          </div>
        )}
      </div>
      <div className="pt-5">
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          <div className="flex items-center flex-col w-full gap-5 order-2 lg:order-none">
            <div className="w-full">
              <InputField
                size="sm"
                type="text"
                label="Username"
                name="username"
                value={formik.values.username}
                formik={formik}
                disabled={!editable}
                placeholder="Username"
              />
            </div>
            {/* <div className="w-full">
              <InputField
                size="sm"
                type="text"
                label="Last Name"
                name="lastName"
                value={formik.values.lastName}
                formik={formik}
                disabled={!editable}
                placeholder="Last Name"
              />
            </div> */}
            <div className="w-full">
              <InputField
                size="sm"
                type="email"
                label="Email"
                name="email"
                value={auth_user?.email}
                disabled={true}
                placeholder="Email"
              />
            </div>
          </div>
          <div className="w-full order-1 flex items-center justify-center">
            <div
              className={`relative group max-w-64 aspect-square overflow-hidden w-full mx-auto rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center flex-col`}
            >
              {profile && editable && (
                <div
                  className="absolute cursor-pointer inset-0 opacity-0 group-hover:opacity-100 transition-all z-[2] w-full h-full bg-black/50 text-white flex items-center justify-center"
                  onClick={() => setProfile("")}
                >
                  <TbPhoto fontSize={80} />
                </div>
              )}

              {profile && (
                <img
                  src={
                    typeof profile === "string"
                      ? profile.startsWith("http")
                        ? profile
                        : `${
                            import.meta.env.VITE_API_URL_IMAGE
                          }/${profile.replace(/^\//, "")}`
                      : ""
                  }
                  alt="User Profile"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}

              {!profile && (
                <DropZone
                  heading="Upload Profile"
                  subheading="Only images are allowed like png, jpeg etc."
                  accept={["image"]}
                  hideUpload={!editable}
                  onUpload={(avatar) => {
                    if (avatar) {
                      dispatch(
                        updateUserInfo(auth_user?._id, {
                          avatar: avatar,
                        })
                      );
                      setEditable(false);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:grid grid-cols-2 gap-4 md:gap-6 items-stretch mt-4 md:mt-6">
          {userInfoLowerList.map((item, index) => {
            return item.type === "heading" ? (
              <h5 key={index} className="col-span-2 mt-2 -mb-2">
                {item.label}
              </h5>
            ) : (
              <div key={index} className={`${item.className}`}>
                {item.type === "select" ? (
                  <Select
                    name={item.name}
                    label={item.label}
                    options={item.options}
                    value={formik.values[item.name]}
                    formik={formik}
                    disabled={!editable}
                  />
                ) : (
                  <InputField
                    size="sm"
                    type={item.type}
                    label={item.label}
                    name={item.name}
                    value={formik.values[item.name]}
                    placeholder={item.placeholder}
                    required={item.required}
                    formik={formik}
                    disabled={!editable}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {editable && (
        <div className="grid grid-cols-2 gap-3 w-full pt-5 lg:hidden lg:order-none">
          <Button
            size="md"
            value="Save"
            isLoading={is_loading}
            disabled={!formik.isValid}
            onClick={formik.submitForm}
          />
          <Button
            size="md"
            value="Cancel"
            isLoading={is_loading}
            variant="white"
            onClick={() => {
              formik.resetForm();
              setEditable(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserInfo;
