import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface ufIBGE {
    sigla: string;
}

interface cityIBGE {
    nome: string;
}

const CreatePoint = () => {
    const [itens, setItens] = useState<Item[]>([]);
    const [ufs, setUFs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [ formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',        
    });
    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItens, setSelectedItens] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();
    // parametros do useEffect: 1º o que a função vai executar e o 2º quando executar
    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<ufIBGE[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUFs(ufInitials);
        });
    }, []);
    
    useEffect(() => {
        // carregar as cidades sempre que a UF mudar
        if(selectedUF === '0') {
            return;
        }

        axios.get<cityIBGE[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response => {
            const cityNames = response.data.map(city => city.nome);

            setCities(cityNames);
        });        
    }, [selectedUF]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            
            setInitialPosition([ latitude, longitude ]);
        });
    }, []);

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }
   
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        //console.log(event.target.value);
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    function handleSelectItem (id: number) {
        // só seleciona um item
        //setSelectedItens([id]);
        // seleciona mais de um, porem não é possivel des-selecionar
        //setSelectedItens([ ...selectedItens, id ]);

        // MANEIRA CORRETA de selecionar mais de um item
        const alreadySelected = selectedItens.findIndex(item => item === id);

        if(alreadySelected >= 0) {
            const filteredItens = selectedItens.filter(item => item !== id);

            setSelectedItens(filteredItens);
        } else {
            setSelectedItens([ ...selectedItens, id ]);
        }
    }

     async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        console.log(selectedFile);
        
        const { name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const itens = selectedItens;

        const data = new FormData();
        
        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('latitude',String(latitude));
        data.append('uf',uf);
        data.append('city',city);
        data.append('longitude',String(longitude));
        data.append('itens',itens.join(','));
        
        if(selectedFile) {
            data.append('image', selectedFile);
        }    

        console.log(data);
        await api.post('/points', data);

        alert('Ponto de coleta criado!');

        history.push('/');  
       
    }        

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="ecoleta" />

                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>  
                <h1>Cadastro do <br />Ponto de Coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>


                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUF} 
                                onChange={handleSelectUF}
                            >
                                <option value="0">Selecione UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="uf">Cidade</label>
                            <select 
                                name="city" 
                                id="city" 
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {itens.map(item => (
                            <li 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItens.includes(item.id) ? 'selected' : ''}
                            >
                            <img src={item.image_url} alt={item.title} />
                            <span>{item.title}</span>
                        </li>
                        ))}                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;