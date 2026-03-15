from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        
        scope["user"] = AnonymousUser()
        
        if token:
            try:
                UntypedToken(token)
                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                scope["user"] = await get_user(decoded_data["user_id"])
            except (InvalidToken, TokenError) as e:
                print("Token Error:", e)
            except Exception as e:
                print("Exception in JWT processing:", e)
                
        try:
            return await self.inner(scope, receive, send)
        except Exception as e:
            print("Unhandled exception in Channels inner scope:", e)
            raise

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
