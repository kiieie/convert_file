import os
import sys
import xml.etree.ElementTree as ET

# Google Indexing API Endpoint
ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

def load_urls_from_sitemap(sitemap_path):
    """sitemap.xml 파일에서 모든 URL을 추출합니다."""
    if not os.path.exists(sitemap_path):
        print(f"Error: Sitemap not found at {sitemap_path}")
        return []
    
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        # XML namespace 처리
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        urls = []
        for url_node in root.findall('ns:url', namespace):
            loc_node = url_node.find('ns:loc', namespace)
            if loc_node is not None and loc_node.text:
                urls.append(loc_node.text.strip())
        return urls
    except Exception as e:
        print(f"Error parsing sitemap: {e}")
        return []

def submit_urls(urls, credentials_path):
    """GCP 서비스 계정 키를 사용하여 Indexing API로 URL 색인을 요청합니다."""
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
    import requests
    
    if not os.path.exists(credentials_path):
        print(f"Error: GCP Credentials file not found at {credentials_path}")
        print("Please place your Service Account JSON key file here or specify the correct path.")
        return False
    
    print(f"Loading credentials from: {credentials_path}")
    scopes = ["https://www.googleapis.com/auth/indexing"]
    
    try:
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=scopes
        )
        # 인증된 세션 생성
        session = AuthorizedSession(credentials)
    except Exception as e:
        print(f"Failed to authenticate with GCP key: {e}")
        return False
    
    print(f"Found {len(urls)} URLs in sitemap.")
    success_count = 0
    fail_count = 0
    
    for i, url in enumerate(urls, 1):
        payload = {
            "url": url,
            "type": "URL_UPDATED"
        }
        
        try:
            response = session.post(ENDPOINT, json=payload)
            if response.status_code == 200:
                print(f"[{i}/{len(urls)}] Success: {url}")
                success_count += 1
            else:
                print(f"[{i}/{len(urls)}] Failed: {url} | Status: {response.status_code} | Response: {response.text}")
                fail_count += 1
        except Exception as e:
            print(f"[{i}/{len(urls)}] Error sending request for {url}: {e}")
            fail_count += 1
            
    print("\n--- Indexing Request Summary ---")
    print(f"Total processed: {len(urls)}")
    print(f"Successfully submitted: {success_count}")
    print(f"Failed: {fail_count}")
    return success_count > 0

def main():
    sitemap_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sitemap.xml")
    
    # 인자로 서비스 계정 키 파일 경로를 받거나, 기본값인 service_account.json 검색
    credentials_path = "service_account.json"
    if len(sys.argv) > 1:
        credentials_path = sys.argv[1]
        
    print("=== 2Convert.org Google Indexing API Tool ===")
    
    # 의존성 검사 및 자동 설치 안내
    try:
        import google.oauth2
    except ImportError:
        print("Required library 'google-auth' is missing.")
        print("Please run: pip install google-auth requests")
        print("Attempting to install dependencies automatically...")
        os.system(f'"{sys.executable}" -m pip install google-auth requests')
        try:
            import google.oauth2
            print("Successfully installed dependencies.")
        except ImportError:
            print("Failed to auto-install dependencies. Please run 'pip install google-auth requests' manually.")
            sys.exit(1)
            
    urls = load_urls_from_sitemap(sitemap_path)
    if not urls:
        print("No URLs found in sitemap.xml. Aborting.")
        sys.exit(1)
        
    # credentials_path가 절대 경로가 아닐 경우 현재 스크립트 디렉토리 기준으로 처리
    if not os.path.isabs(credentials_path):
        credentials_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), credentials_path)
        
    success = submit_urls(urls, credentials_path)
    if not success:
        print("\n[NOTE] Google Indexing API requires a GCP service account.")
        print("1. Create a GCP Project and enable Indexing API.")
        print("2. Create a Service Account and download the JSON key file.")
        print("3. Add the Service Account email to your Google Search Console property as Owner.")
        print(f"4. Run: python submit_indexing.py [path_to_key.json]")
        sys.exit(1)

if __name__ == "__main__":
    main()
