# apiops-reference
Reference Implementation

Sample:

      - name: Send POST request with Curl
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -d '{
                  "key1": "value1",
                  "key2": "value2"
                }' \
            https://example.com/api/endpoint
