import json
import socket
from urllib import error, request

from django.conf import settings


class AiProviderError(Exception):
    pass


class AiProviderClient:
    def __init__(self):
        self.base_url = settings.AI_TUTOR_BASE_URL.rstrip('/')
        self.api_key = settings.AI_TUTOR_API_KEY
        self.model = settings.AI_TUTOR_MODEL
        self.provider_name = settings.AI_TUTOR_PROVIDER_NAME
        self.timeout = settings.AI_TUTOR_TIMEOUT

    def chat(self, messages):
        if not self.api_key:
            raise AiProviderError('AI_TUTOR_API_KEY is not configured')

        payload = {
            'model': self.model,
            'messages': messages,
            'temperature': 0.4,
        }
        req = request.Request(
            url=f'{self.base_url}/chat/completions',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}',
            },
            method='POST',
        )

        try:
            with request.urlopen(req, timeout=self.timeout) as response:
                body = json.loads(response.read().decode('utf-8'))
        except error.HTTPError as exc:
            detail = exc.read().decode('utf-8', errors='ignore')
            raise AiProviderError(f'AI provider returned HTTP {exc.code}: {detail}') from exc
        except (error.URLError, socket.timeout) as exc:
            reason = getattr(exc, 'reason', str(exc))
            raise AiProviderError(f'AI provider unavailable: {reason}') from exc
        except (json.JSONDecodeError, TimeoutError) as exc:
            raise AiProviderError('AI provider returned malformed response') from exc

        try:
            return body['choices'][0]['message']['content']
        except (KeyError, IndexError, TypeError) as exc:
            raise AiProviderError('AI provider response missing assistant content') from exc
