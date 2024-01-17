from flask import Flask, request, jsonify
app = Flask(__name__)

import pandas as pd 
import numpy as np
from keras.models import load_model
import tensorflow as tf
import cv2
import json
from keras.preprocessing.image import ImageDataGenerator

file_path = 'C:/Users/DELL/documents/eddw/major-project/backend/trained_models/'


imageSize=224
image_details_data=pd.read_csv('C:/Users/DELL/documents/eddw/major-project/backend/upload/image.csv') 
images_directory='C:/Users/DELL/documents/eddw/major-project/backend/upload' 

images=image_details_data['image']
predict_images=pd.DataFrame(images,columns=['image'])
select_data=predict_images.iloc[0]
select_img=list(select_data)

def generate_image_datagenerator(select_img):
    predict_images1=pd.DataFrame(select_img,columns=['image'])
    predict_images1['result']='to predict'
    predict_data_gen=ImageDataGenerator(rescale=1./255.)
    predicting_generator=predict_data_gen.flow_from_dataframe(
    dataframe=predict_images1,
    directory=images_directory,
    x_col="image",
    y_col="result",
    batch_size=32,
    seed=42,
    shuffle=False,
    class_mode="categorical",
    target_size=(224,224))
    return predicting_generator


def check_image_validity():
    predicting_generator=generate_image_datagenerator(select_img)
    validity_model = load_model(file_path + 'input.hdf5')
    pred1 = validity_model.predict_generator(predicting_generator)
    max = np.argmax(pred1)
    if max == 0:
        return 1
    else: 
        return 0

def check_for_disease(user_selected_choice):
        predicting_generator=generate_image_datagenerator(select_img)
        predPerc = 0
        if(user_selected_choice==1): ##cataract detection
            cataract_model=load_model(file_path + 'cataract1.hdf5')
            pred1 = cataract_model.predict_generator(predicting_generator)
            predicted_class_idx1=np.argmax(pred1,axis=1)  ##0 for cataract
            predPerc = pred1[0][predicted_class_idx1]

        elif(user_selected_choice==2): ##myopia detection
            myopia_model=load_model(file_path + 'Myopia.hdf5')
            pred1 = myopia_model.predict_generator(predicting_generator)
            predicted_class_idx1=np.argmax(pred1,axis=1)  ##0 for myopia
            predPerc = pred1[0][predicted_class_idx1]
            

        elif(user_selected_choice==3):  ##hypertension detection
            hyp_gla_model=load_model(file_path + 'HN1.hdf5')
            pred1 = hyp_gla_model.predict_generator(predicting_generator)
            predicted_class_idx1=np.argmax(pred1,axis=1) ##1 for hypertension
            predPerc = pred1[0][predicted_class_idx1]
            
        
        elif(user_selected_choice==4):##glaucoma detection
            hyp_gla_model=load_model(file_path + 'GN1.hdf5')
            pred1 = hyp_gla_model.predict_generator(predicting_generator)
            predicted_class_idx1=np.argmax(pred1,axis=1)  ##0 for glaucoma
            predPerc = pred1[0][predicted_class_idx1]
            

        elif(user_selected_choice==5):  ##retinoblastoma detection
            retinoblastoma_model=load_model(file_path + 'retinoblastoma2_time.hdf5')
            pred1 = retinoblastoma_model.predict_generator(predicting_generator)
            predicted_class_idx1=np.argmax(pred1,axis=1)  ##1 for retinoblastoma
            predPerc = pred1[0][predicted_class_idx1]
            

        elif(user_selected_choice==6):  ##normal
            normal_model=load_model(file_path + 'Normal.hdf5')
            pred1 = normal_model.predict_generator(predicting_generator)
            predicted_class_idx1=np.argmax(pred1,axis=1) ##0 for normal
            predPerc = pred1[0][predicted_class_idx1]

        return (predicted_class_idx1[0], predPerc)

@app.route('/check_disease', methods=['POST'])
def check_disease():
    validity = check_image_validity()
    if validity == 0:
        return json.dumps({'valid':0})
    diseases = [int(i) for i in request.json['user_selected_choice'].split(',')]
    results = []
    for i in diseases:
        result = check_for_disease(i)
        predicted_class_idx, percentage = int(result[0]), float(result[1][0])
        results.append([predicted_class_idx, percentage])
    return json.dumps({'valid':1,'result': results})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)