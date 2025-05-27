FROM coturn/coturn:latest

COPY turnserver.conf /etc/coturn/turnserver.conf

EXPOSE 3478/udp
EXPOSE 3478/tcp
EXPOSE 49152-65535/udp

CMD ["turnserver", "-c", "/etc/coturn/turnserver.conf"]
