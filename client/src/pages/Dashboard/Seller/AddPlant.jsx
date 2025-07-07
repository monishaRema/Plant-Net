import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../Api/utils";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import toast from "react-hot-toast";

const AddPlant = () => {
  const { user } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [placeholderImg,setPlaceholderImg] = useState('https://t4.ftcdn.net/jpg/06/71/92/37/360_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg')

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setIsUploading(true);

    const form = e.target;
    const name = form?.name.value;
    const category = form?.category.value;
    const description = form?.description.value;
    const price = form?.price.value;
    const quantity = form?.quantity.value;
    const image = form?.image.files[0];

    try {
      const imageUrl = await imageUpload(image);
      setPlaceholderImg(imageUrl)
      const plantData = {
        name,
        category,
        description,
         price: parseFloat(price),
        quantity: parseInt(quantity),
        image: imageUrl,
        seller:{
          name:user?.displayName,
          email:user?.email,
          image:user?.photoURL
        }
      };
      // console.table(plantData);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/plant/add-plant`,
        plantData
      )
      toast.success('Plant Data added succesfully')
      form.reset()

    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div>
      {/* Form */}
      <AddPlantForm handleFormSubmit={handleFormSubmit} isUploading={isUploading} placeholderImg={placeholderImg} />
    </div>
  );
};

export default AddPlant;
