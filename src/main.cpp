#include "zip.h"
#include "unzip.h"
#include "ioapi_mem.h"

#define SIZE_FILENAME 32767 + 1
#define SIZE_STR 64

extern "C" {

char* list(char* buf, size_t len, size_t* ufListLen, int* reterr) {
	char* ufList = (char*)calloc(SIZE_STR, sizeof(ufList));
	unzFile uf = NULL;
	zlib_filefunc_def filefunc32 = {0};
	ourmemory_t unzmem = {0};
	int err = UNZ_OK;
	*reterr = 1;
	
	strcat(ufList, "[");
	
	unzmem.size = len;
	unzmem.base = buf;
	
	fill_memory_filefunc(&filefunc32, &unzmem);
	
	uf = unzOpen2("__notused__", &filefunc32);
	if (uf == NULL) {
		free(ufList);
		return (char*)"error with zipfile in unzOpen2";
	}
	
	err = unzGoToFirstFile(uf);
	if (err != UNZ_OK) {
		free(ufList);
		return (char*)"error with zipfile in unzGoToFirstFile";
	}
	
	do {
		char filename_inzip[SIZE_FILENAME] = {0};
		unz_file_info64 file_info = {0};
		int i = 0;
		char filename_hex[SIZE_FILENAME*2] = {0};
		char* p = filename_hex;
		
		err = unzGetCurrentFileInfo64(uf, &file_info, filename_inzip, sizeof(filename_inzip), NULL, 0, NULL, 0);
		if (err != UNZ_OK) {
			free(ufList);
			return (char*)"error with zipfile in unzGetCurrentFileInfo";
		}
		
		ufList = (char*)realloc(ufList, (strlen(filename_inzip)*2+strlen(ufList)+SIZE_STR)*sizeof(ufList));
		
		strcat(ufList, "{\"filename_inzip\":\"");
		
		for (i = 0; i < strlen(filename_inzip); i++) {
			p += sprintf(p, "%02x", filename_inzip[i] & 0xFF);
		}
		strcat(ufList,&filename_hex[0]);
		strcat(ufList, "\",");
		
		strcat(ufList, "\"charCrypt\":");
		if ((file_info.flag & 1) != 0)
			strcat(ufList, "true");
		else
			strcat(ufList, "false");
		strcat(ufList, "},");
		
		err = unzGoToNextFile(uf);
	} while (err == UNZ_OK);
	
	if (err != UNZ_END_OF_LIST_OF_FILE && err != UNZ_OK) {
		free(ufList);
		return (char*)"error with zipfile in unzGoToNextFile";
	}
	
	unzClose(uf);
	ufList[strlen(ufList)-1] = 0;
	strcat(ufList, "]");
	*ufListLen = strlen(ufList);
	*reterr = 0;
	return ufList;
}

char* extract(char* buf, size_t len, char* filename, char* password, size_t* fileBufSize, size_t* newLen, int* reterr) {
	char* fileBuf= NULL;
	unzFile uf = NULL;
	zlib_filefunc_def filefunc32 = {0};
	ourmemory_t unzmem = {0};
	unz_file_info64 file_info = {0};
	int err = UNZ_OK;
	*reterr = 1;
	
	unzmem.size = len;
	unzmem.base = buf;
	
	fill_memory_filefunc(&filefunc32, &unzmem);
	
	uf = unzOpen2("__notused__", &filefunc32);
	if (uf == NULL) {
		return (char*)"error with zipfile in unzOpen2";
	}
	
	if (unzLocateFile(uf, filename, NULL) != UNZ_OK) {
		return (char*)"error file not found in the zipfile";
	}
	
	err = unzGetCurrentFileInfo64(uf, &file_info, filename, sizeof(filename), NULL, 0, NULL, 0);
	if (err != UNZ_OK) {
		return (char*)"error with zipfile in unzGetCurrentFileInfo";
	}
	
	err = unzOpenCurrentFilePassword(uf, password);
	if (err != UNZ_OK) {
		return (char*)"error with zipfile in unzOpenCurrentFilePassword";
	}
	
	fileBuf = (char*)malloc(file_info.uncompressed_size);
	if (fileBuf == NULL) {
		return (char*)"error allocating memory";
	}
	
	err = unzReadCurrentFile(uf, fileBuf, file_info.uncompressed_size);
	if (err != file_info.uncompressed_size) {
		free(fileBuf);
		return (char*)"error with zipfile in unzReadCurrentFile";
	}
	*fileBufSize = (size_t)file_info.uncompressed_size;
	
	err = unzCloseCurrentFile(uf);
	if ((err != UNZ_CRCERROR) && (err != UNZ_OK)) {
		free(fileBuf);
		return (char*)"error with zipfile in unzCloseCurrentFile";
	}
	
	unzClose(uf);
	*reterr = 0;
	*newLen = unzmem.size;
	return fileBuf;
}

char* append(int newBuf, char* buf, size_t len, size_t* newLen, char* filename, char* password, char* fileBuf, size_t fileLen, int opt_compress_level, int* reterr) {
	zipFile zf = NULL;
	zlib_filefunc_def filefunc32 = {0};
	ourmemory_t zipmem = {0};
	int err = UNZ_OK;
	uint32_t crcFile = 0;
	int zip64 = 0;
	const char *savefilenameinzip;
	*reterr = 1;
	
	if (newBuf == 1) {
		zipmem.grow = 1;
		fill_memory_filefunc(&filefunc32, &zipmem);
		zf = zipOpen3("__notused__", APPEND_STATUS_CREATE, 0, 0, &filefunc32);
	} else {
		zipmem.size = len;
		zipmem.base = buf;
		zipmem.grow = 1;
		fill_memory_filefunc(&filefunc32, &zipmem);
		zf = zipOpen3("__notused__", APPEND_STATUS_ADDINZIP, 0, 0, &filefunc32);
	}
	if (zf == NULL) {
		return (char*)"error opening zipfile in zipOpen3";
	}
	
	if ((password != NULL) && (err == ZIP_OK)) {
		crc32(crcFile, (const unsigned char*)fileBuf, fileLen);
	}
	
	zip64 = (fileLen >= 0xffffffff);
	
	savefilenameinzip = filename;
	while (savefilenameinzip[0] == '\\' || savefilenameinzip[0] == '/')
		savefilenameinzip++;
	
	err = zipOpenNewFileInZip3_64(zf, savefilenameinzip, NULL, NULL, 0, NULL, 0, NULL, (opt_compress_level != 0) ? Z_DEFLATED : 0, opt_compress_level,0, -MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY, password, crcFile, zip64);
	if (err != ZIP_OK) {
		return (char*)"error in opening in zipfile";
	}
	
	err = zipWriteInFileInZip(zf, fileBuf, fileLen);
	if (err < 0) {
		return (char*)"error in writing in the zipfile";
	}
	
	err = zipCloseFileInZip(zf);
	if (err != ZIP_OK) {
		return (char*)"error in closing in the zipfile";
	}
	
	err = zipClose(zf, NULL);
	if (err != ZIP_OK) {
		return (char*)"error in closing";
	}
	
	*reterr = 0;
	*newLen = zipmem.size;
	return zipmem.base;
}

}