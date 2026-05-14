from django.urls import include, path
from django.contrib import admin


urlpatterns = [
    path('admin/', admin.site.urls),

    path('auth/', include('accounts.public_urls')),
    path('billing/', include('billing.urls'))

]