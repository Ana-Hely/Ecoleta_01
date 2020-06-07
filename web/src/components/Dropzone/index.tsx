import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import './style.css';

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
    const [selectedFileUrl, setSelectedFielUrl] = useState('');

    const onDrop = useCallback(acceptedFiles => {
         console.log(acceptedFiles);

        const file = acceptedFiles[0];

        const fileUrl = URL.createObjectURL(file);

        setSelectedFielUrl(fileUrl);
        onFileUploaded(file);

    }, [onFileUploaded]); 

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*'
    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*" />
            {
                selectedFileUrl
                    ? <img src={selectedFileUrl} alt="Point thombnail" />
                    :  (
                        isDragActive ?
                            <p>Arraste o arquivo aqui ...</p> :
                            <p>
                                <FiUpload />
                                Imagem do estabelecimento
                            </p>
                    )
            }
        </div>
    )
}

export default Dropzone;