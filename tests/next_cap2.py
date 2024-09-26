import email
from email import policy
from email.parser import BytesParser
import os


def mhtml_to_html(mhtml_path, output_path):
    # 读取MHTML文件
    with open(mhtml_path, 'rb') as f:
        mhtml_content = f.read()

    # 解析MHTML内容
    msg = BytesParser(policy=policy.default).parsebytes(mhtml_content)

    # 查找HTML部分
    for part in msg.walk():
        if part.get_content_type() == 'text/html':
            charset = part.get_content_charset() or 'utf-8'
            html_content = part.get_payload(decode=True).decode(charset)
            break
    else:
        raise ValueError("No HTML content found in the MHTML file")

    # 保存HTML内容到文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"HTML content has been extracted and saved to {output_path}")


# 使用示例
mhtml_file = '/Users/thomas/repo/014/sAveIt/tests/mhtml server - Google Search.mhtml'
output_file = '/Users/thomas/repo/014/sAveIt/tests/file.html'
mhtml_to_html(mhtml_file, output_file)