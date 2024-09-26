import email
from email import policy
from email.parser import BytesParser
import os


def mhtml_to_html(mhtml_path, output_path):
    try:
        # 读取MHTML文件
        with open(mhtml_path, 'rb') as f:
            mhtml_content = f.read()

        # 解析MHTML内容
        msg = BytesParser(policy=policy.default).parsebytes(mhtml_content)

        # 初始化HTML和CSS内容
        html_contents = []
        css_content = ''

        # 遍历各部分
        for part in msg.walk():
            content_type = part.get_content_type()
            charset = part.get_content_charset() or 'utf-8'

            if content_type == 'text/html':
                try:
                    html_content = part.get_payload(decode=True).decode(charset)
                    html_contents.append(html_content)
                except (UnicodeDecodeError, LookupError) as e:
                    print(f"Failed to decode HTML with charset {charset}: {e}")

            elif content_type == 'text/css':
                try:
                    css_content += part.get_payload(decode=True).decode(charset) + '\n'
                except (UnicodeDecodeError, LookupError) as e:
                    print(f"Failed to decode CSS with charset {charset}: {e}")

        if not html_contents:
            raise ValueError("No HTML content found in the MHTML file")

        # 合并HTML内容
        combined_html = ''
        for html in html_contents:
            # 在每个HTML的<head>部分插入CSS
            if css_content:
                css_tag = f'<style>\n{css_content}</style>'
                if '<head>' in html:
                    html = html.replace('<head>', f'<head>\n{css_tag}', 1)
                else:
                    html = css_tag + html
            combined_html += html

        # 保存合并后的HTML内容到文件
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(combined_html)

        print(f"HTML content with CSS has been extracted and saved to {output_path}")

    except FileNotFoundError:
        print(f"The file {mhtml_path} does not exist.")
    except IOError as e:
        print(f"An IO error occurred: {e}")


# 使用示例
mhtml_file = 'mhtml web page serving · Badgerati_Pode · Discussion #1085.mhtml'
output_file = '/Users/thomas/repo/014/sAveIt/tests/file.html'
mhtml_to_html(mhtml_file, output_file)
