import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Image, List, Search } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';
import { useRouter } from 'next/router';
import axios from 'axios';
let cancel;

const SearchComponent = () => {
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState([]);
	const router = useRouter();
	const handleChange = async (e) => {
		const { value } = e.target;
		setText(value);

		if (value.length === 0) return;

		//trim will remove white spaces.
		if (value.trim().length === 0) return;
		setText(value);
		setLoading(true);
		try {
			cancel && cancel();
			const CancelToken = axios.CancelToken;

			const token = Cookies.get('token');

			const res = await axios.get(`${baseUrl}/api/search/${value}`, {
				headers: { Authorization: token },
				cancelToken: new CancelToken((canceler) => (cancel = canceler)),
			});
			console.log(res);
			if (res.data.length === 0) {
				results.length > 0 && setResults([]);
				setLoading(false);
			}
			setResults(res.data);
		} catch (error) {
			console.error('Error searching');
		}
		setLoading(false);
	};
	useEffect(() => {
		if (text.length === 0 && loading) {
			setLoading(false);
		}
	}, [text]);
	return (
		<Search
			onBlur={() => {
				results.length === 0 && setResults([]);
				loading && setLoading(false);
				setText('');
			}}
			loading={loading}
			value={text}
			resultRenderer={resultRenderer}
			results={results}
			onSearchChange={handleChange}
			minCharacters={1}
			onResultSelect={(e, data) => {
				router.push(`/${data.result.username}`);
			}}
		/>
	);
};

const resultRenderer = ({ profilePicUrl, _id, name }) => {
	console.log();
	return (
		<List key={_id}>
			<List.Item>
				<Image
					src={profilePicUrl}
					alt='profilePicUrl'
					avatar
				/>
				<List.Content
					header={name}
					as='a'
				/>
			</List.Item>
		</List>
	);
};

export default SearchComponent;
