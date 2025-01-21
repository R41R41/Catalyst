// もしブラウザ環境でのロギングが必要であれば、以下のようにconsoleを使用
const logger = {
	error: (message: string, error?: any) => {
		console.error(message, error);
	},
	info: (message: string) => {
		console.info(message);
	},
	// 他のログレベルも必要に応じて追加
};

export default logger;
